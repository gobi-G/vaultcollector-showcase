# AI-Scan Accuracy Improvement Plan

> Erstellt: 2026-03-27
> Basierend auf: 3-Agent-Analyse (AI-Engineer, Architect, UX-Researcher)
> Benchmark: 67% gemessen (77% real nach Benchmark-Bug-Fix), Ziel: >=85%

---

## Ausgangslage

| Metrik | Wert |
|--------|------|
| Getestete Karten | 30 (10 Pokemon, 10 Magic, 10 Yu-Gi-Oh) |
| Gemessene Accuracy | 67% (verfaelscht durch Benchmark-Bug) |
| Reale Accuracy | ~77% (nach Bug-Korrektur) |
| Name Accuracy | 97% |
| Card Number Accuracy | 50% |
| Passcode Accuracy (YGO) | 100% |
| Scryfall ID Accuracy (Magic) | 13% |

### Hauptprobleme nach Kategorie

| TCG-Typ | Hauptproblem |
|---------|-------------|
| Pokemon | Benchmark zaehlt scryfallId falsch (Bug), sonst gut |
| Yu-Gi-Oh | GPT-4o gibt cardNumber als null zurueck (Prompt-Problem) |
| Magic | Set-Halluzination bei alten Karten, cardNumber mit /total Suffix |

---

## Phase 1: Quick Wins (~1 Stunde, 77% -> ~87%)

### 1.1 Benchmark-Bug fixen
- [ ] `benchmark/ground-truth.json`: Bei allen Pokemon/YGO-Eintraegen `"scryfallId": null` explizit setzen (statt Feld weglassen)
- **Warum:** `undefined === null` ist `false` -> 20 Karten verlieren 1 Punkt fuer ein irrelevantes Feld
- **Aufwand:** 5 min

### 1.2 YGO Prompt: Set-Code auf cardNumber mappen
- [ ] `supabase/functions/ai-scan/index.ts`, Zeile ~164: Prompt aendern
- **Vorher:** `- Set Code: Below artwork right side (e.g. "LOB-EN005")`
- **Nachher:** `- Set Code -> put this in the "cardNumber" field: Below artwork right side (e.g. "LOB-EN005"). CRITICAL: This is the MOST IMPORTANT identifier.`
- **Warum:** GPT-4o versteht nicht dass "Set Code" in das JSON-Feld "cardNumber" gehoert
- **Aufwand:** 10 min

### 1.3 Magic cardNumber Normalisierung
- [ ] `supabase/functions/ai-scan/index.ts`, `normalizeCardNumber()` Zeile ~64-70: `/total` Suffix strippen
- **Fix:** `cardNumber.split("/")[0]` fuer Magic hinzufuegen
- **Warum:** GPT gibt "138/303" zurueck, erwartet wird "138"
- **Aufwand:** 5 min

### 1.4 Magic Prompt: Set-Halluzination verhindern
- [ ] `supabase/functions/ai-scan/index.ts`, Zeile ~169-172: Prompt erweitern
- **Hinzufuegen:** Anweisungen fuer alte Karten ohne Set-Code (Copyright-Jahr pruefen, Frame-Style, bei Unsicherheit scryfallId auf null setzen statt raten)
- **Warum:** GPT halluziniert Sets bei pre-2015 Karten ohne gedruckten Set-Code
- **Aufwand:** 30 min

### 1.5 scryfallId Normalisierung
- [ ] `supabase/functions/ai-scan/index.ts`, `validateWithScryfall()` Zeile ~84-104: Promo-Prefix strippen, lowercase
- **Fix:** `"ltr/p0451"` -> `"ltr/451"`
- **Aufwand:** 15 min

### 1.6 Erneut benchmarken
- [ ] Benchmark laufen lassen, Ergebnisse dokumentieren
- **Ziel:** >=85% nach Quick Wins

---

## Phase 2: UX-Wins (2-3 Tage, erlebte Accuracy -> ~95%)

### 2.1 "Meintest du...?" Top-3 Vorschlaege
- [ ] Neue Komponente `ScanSuggestionView.tsx` in `components/features/`
- [ ] `ScanScreen.tsx`: Drei-Stufen-Logik statt binaer
  - `>= 0.7`: Direkt zum ScanResultView (wie bisher)
  - `0.2 - 0.7`: ScanSuggestionView mit Top-3 Karten
  - `< 0.2`: Fehler mit Fallback-Optionen
- **Warum:** Viele "Fehlschlaege" haben die richtige Karte als 2. oder 3. Treffer
- **Aufwand:** M

### 2.2 Sofort-Fallback zur manuellen Suche
- [ ] Neue Komponente `ScanFailedView.tsx` mit Suchfeld + "Erneut scannen" Button
- [ ] i18n-Key `scan.tryManual` existiert bereits — endlich einbinden
- [ ] Im catch-Block: `ScanFailedView` statt stiller Reset (`setFrozenPhoto(null)`)
- **Warum:** User sitzt in Sackgasse nach fehlgeschlagenem Scan
- **Aufwand:** S

### 2.3 Mehrstufiges Scan-Feedback
- [ ] Neuer State `scanPhase` in ScanScreen: "compress" | "ai" | "lookup" | "done"
- [ ] Phasen-Anzeige statt nur "Analyzing card..." Spinner
- [ ] Neue i18n-Keys: `scan.phaseCompress`, `scan.phaseAi`, `scan.phaseLookup`, `scan.phaseAlmostDone`
- **Warum:** 5-15 Sekunden nur Spinner wirkt wie Haenger
- **Aufwand:** S

### 2.4 Fehler-Feedback statt stiller Fail
- [ ] `ScanScreen.tsx` catch-Block: Toast mit erklaerenden Fehlermeldungen
- [ ] Kontextbezogene Tipps (zu dunkel? zu nah? keine Karte erkannt?)
- **Warum:** Aktuell sieht User nach Fehler einfach wieder die Kamera — kein Feedback
- **Aufwand:** S

### 2.5 Confidence-Darstellung ueberarbeiten
- [ ] Statt Prozent-Zahl: Checklisten-UI (Name, Nummer, Set, Bild)
- [ ] "Wrong version?" bei confidence < 80% automatisch aufklappen
- [ ] Positives Framing: "Erkannt" statt "52%"
- **Warum:** "52% — please verify" fuehlt sich wie Fehler an, auch bei korrekter Karte
- **Aufwand:** S-M

---

## Phase 3: Architektur (1 Woche, Wartbarkeit + Robustheit)

### 3.1 Secondary Lookups implementieren
- [ ] Pokemon: Nach GPT-Call Lookup gegen `pokemontcg.io` mit name + setName (Provider existiert bereits!)
- [ ] Yu-Gi-Oh: Neuer `YgoProDeckProvider` fuer Passcode-Validierung
- [ ] Bei Treffer: cardApiId befuellen, Confidence erhoehen
- [ ] Bei keinem Treffer: Confidence reduzieren
- **Warum:** Aktuell nur Magic hat Scryfall-Validierung, Pokemon/YGO vertrauen blind auf GPT
- **Aufwand:** M

### 3.2 Edge Function auf 4-Layer-Architektur refactoren
- [ ] OpenAI-Logik aus `ai-scan/index.ts` in `openai.provider.ts` verschieben
- [ ] AI-Service als Orchestrator fuer GPT-Call + TCG-Validation
- [ ] Edge Function wird thin: validate input, call service, return response
- **Warum:** Aktuell bypassed die Edge Function die gesamte Architektur, `openai.provider.ts` und `ai.service.ts` werden nie aufgerufen
- **Aufwand:** L

### 3.3 AiScanResultSchema in shared/
- [ ] `packages/shared/src/schemas/ai-scan.schema.ts` erstellen als Zod-Schema
- [ ] Alle 3 manuellen Typ-Definitionen ersetzen (Edge Function, Provider Interface, Mobile Service)
- **Warum:** CardRecognitionResult ist 3x manuell definiert mit unterschiedlichen Feldern
- **Aufwand:** S

### 3.4 Retry-Logik fuer OpenAI
- [ ] Exponential-Backoff Retry (2-3 Versuche) fuer 429/5xx Responses
- [ ] Gehoert in `openai.provider.ts` (nach Refactoring)
- **Warum:** Aktuell: 1 transienter Fehler = Scan verloren, kein Retry
- **Aufwand:** S

### 3.5 Rate-Limit atomisch machen
- [ ] 3 separate DB-Queries zu 1 zusammenfuehren (JOIN profiles + scan_usage)
- [ ] Atomisches Inkrement: `UPDATE ... SET scan_count = scan_count + 1 WHERE scan_count < max`
- **Warum:** Race Condition bei parallelen Requests, N+1 Query Problem
- **Aufwand:** S-M

---

## Scryfall-Validierung verschaerfen
- [ ] Nach Scryfall-Lookup: `collector_number` gegen `cardNumber` pruefen
- [ ] Bei Mismatch: scryfallId nicht uebernehmen, Confidence reduzieren
- **Warum:** Fuzzy-Suche kann Karte aus falschem Set zurueckgeben (false positive)
- **Aufwand:** S

---

## Erfolgskriterien

| Metrik | Aktuell | Nach Phase 1 | Nach Phase 2 | Nach Phase 3 |
|--------|---------|-------------|-------------|-------------|
| Technische Accuracy | 77% (real) | >=85% | >=85% | >=90% |
| Erlebte Accuracy | ~67% | ~85% | ~95% | ~95% |
| Latenz (Median) | ? | ? | ? | <3s |
| Benchmark-Karten | 30 | 30 | 50+ | 50+ |
