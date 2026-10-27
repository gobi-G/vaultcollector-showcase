# AI Scan Improvement

Verbessere den AI Scan Flow von VaultCollector.

## Architektur — AI Scan Flow verstehen

```
ScanScreen.tsx
  → compressAndEncodeImage()     [ImageUtils.ts]        1024px, 85% JPEG
  → validateCapturedImage()      [ImageValidation.ts]   zu klein / schlechte Qualität
  → aiScanService.recognizeCard() [via @/services]      → supabase/functions/ai-scan/index.ts
      → GPT-4o Vision (detail: "high")
      → CardRecognitionResult (name, tcgType, confidence, passcode, scryfallId, ...)
  → Card API Lookup (Precise → Fallback)
      Pokemon:  searchByNameAndNumber()
      Yu-Gi-Oh: ygoProSearch.getById(passcode)
      Magic:    scryfallSearch.getById(scryfallId) → Fallback: name+cn:{number}
  → calculateConfidence()        [ScanConfidence.ts]    app-seitiges Scoring
  → Artwork Matching             [SupabaseArtworkMatch]  bei mehreren Artworks
  → ScanResult → ScanResultView → ScanSaveSheet
```

## Dateien des AI Scan Systems

| Datei | Zweck |
|---|---|
| `supabase/functions/ai-scan/index.ts` | Edge Function: GPT-4o Vision Call, System Prompt |
| `apps/mobile/src/screens/scan/ScanScreen.tsx` | UI, Capture, Lookup-Logik, State |
| `apps/mobile/src/utils/ScanConfidence.ts` | Confidence Scoring (0-95 Punkte) |
| `apps/mobile/src/utils/ImageUtils.ts` | Bildkompression vor AI-Call |
| `apps/mobile/src/utils/ImageValidation.ts` | Qualitätsprüfung vor AI-Call |
| `apps/mobile/src/services/interfaces/AiScanInterface.ts` | AiScanResult Typ |
| `supabase/functions/_shared/` | Auth, CORS, Response Helpers |

## Confidence Scoring Regeln (ScanConfidence.ts)

| Match-Typ | Score |
|---|---|
| Yu-Gi-Oh Passcode Match | 90 |
| Magic scryfallId + Name Match | 90 |
| Pokémon Name + Collector Number | 85 |
| Name + Set Match | 75 |
| Name + ID Match | 80 |
| Nur ID Match | 75 |
| Nur Name Match | 55 |
| Kein Match | 30 |
| Bonus: Image vorhanden | +5 |
| Bonus: Set Match bei Score ≥ 70 | +5 |
| Maximum | 95 |

Level: ≥80 = "high", ≥50 = "medium", <50 = "low"

## GPT-4o System Prompt Regeln (nie brechen)
- **FACTS OVER GUESSES** — nur was direkt auf der Karte lesbar ist
- `cardApiId` ist immer `null` — App macht den API Lookup
- `name` ist CLEAN — keine visuellen Deskriptoren wie "(Full Art)" → geht in `variant`
- Immer englischer Kartenname, egal welche Sprache auf der Karte
- Verification Rules: 0↔O, 1↔l, 5↔S — bei Unsicherheit → `null`
- Yu-Gi-Oh Passcode: exakt 8 Stellen, sonst `null`
- Magic scryfallId Format: `"set/number"` lowercase (z.B. `"rna/123"`)

## Lookup-Fallback Reihenfolge (ScanScreen.tsx)
1. Precise Match (passcode / scryfallId / name+number)
2. Name Cleaning (entferne Klammern, Bindestriche + Zahl am Ende)
3. Kürzerer Name (max. 3 Wörter) bei leeren Ergebnissen
4. Collector Number Match in Ergebnisliste
5. Set Name Match (fuzzy: Word Overlap)
6. Erster Treffer als letzter Fallback

## Häufige Probleme und Lösungen

**GPT-4o liest falsche Set-Code → scryfallId schlägt fehl**
→ Secondary Lookup: `name + cn:{number}` via scryfallSearch.search()
→ Bereits implementiert in ScanScreen.tsx

**GPT-4o fügt visuellen Deskriptor zum Namen hinzu**
→ Name Cleaning: `replace(/\s*\(.*?\)\s*$/g, "")` vor API-Suche

**Schlechte Bildqualität → AI unsicher**
→ validateCapturedImage() vor AI-Call
→ Bei Fehler: toast.error + setFrozenPhoto(null) — kein API-Call

## Was du tun sollst

Falls ein Argument übergeben wird (z.B. `/ai-scan prompt`), arbeite gezielt an diesem Bereich:

- **`/ai-scan prompt`** — System Prompt in `ai-scan/index.ts` verbessern (neue Karten-Typen, bessere Verification Rules, Few-Shot Beispiele)
- **`/ai-scan confidence`** — Scoring-Logik in `ScanConfidence.ts` anpassen (neue Scoring-Tier, Bonuspunkte)
- **`/ai-scan lookup`** — Lookup-Logik in `ScanScreen.tsx` verbessern (neuer Lookup-Pfad, besserer Fallback)
- **`/ai-scan image`** — Bildverarbeitung in `ImageUtils.ts` / `ImageValidation.ts` verbessern
- **`/ai-scan category`** — Neue TCG-Kategorie zum Scan-System hinzufügen (Prompt + Confidence + Lookup)

Falls kein Argument: lese alle 4 Dateien, analysiere was verbessert werden kann, und schlage konkrete Änderungen vor.

## Regeln
- System Prompt: keine Breaking Changes an bestehenden JSON-Feldern
- Confidence Scoring: Score nie über 95 (Unsicherheit bleibt immer)
- Kein direkter OpenAI-Call vom Client — immer über Edge Function
- Bei neuem TCG-Typ: `CardRecognitionResult` Typ in `ai-scan/index.ts` erweitern UND `AiScanInterface.ts` anpassen
- Tests: Accuracy manuell mit echten Karten messen nach jeder Prompt-Änderung
- Nach Änderungen: `supabase functions deploy ai-scan --project-ref <ref>`
