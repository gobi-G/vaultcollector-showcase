# AI Scan Benchmark

Führe einen Benchmark des AI Scan Systems durch und analysiere die Ergebnisse.

## Dateien

| Datei | Zweck |
|---|---|
| `benchmark/ground-truth.json` | Erwartete Ergebnisse pro Karte |
| `benchmark/images/` | Kartenfotos (card_01.jpg, card_02.jpg, ...) |
| `benchmark/run-benchmark.ts` | Benchmark Script |
| `benchmark/results.json` | Ausgabe: detaillierte Ergebnisse |
| `benchmark/results.csv` | Ausgabe: CSV für Tabellen |

## Schritt 1 — Ground Truth vorbereiten

Falls ein Argument übergeben wird (z.B. `/scan-benchmark setup`):

Öffne `benchmark/ground-truth.json` und füge Einträge hinzu:

```json
{
  "image": "images/card_XX.jpg",
  "expected": {
    "name": "Exakter englischer Kartenname",
    "tcgType": "pokemon" | "yugioh" | "magic",
    "cardNumber": "223/197" | null,
    "setName": "Exakter Set-Name",
    "passcode": "46986414" | null,
    "scryfallId": "set/number" | null
  },
  "notes": "z.B. Special Art Rare, deutsch, 1st Edition"
}
```

**Regeln für Ground Truth:**
- `name`: exakt wie auf der Karte, englisch, mit Suffix (ex, VMAX, GX)
- `cardNumber`: exakt wie gedruckt (z.B. "223/197", nicht "223")
- `passcode`: exakt 8 Stellen (Yu-Gi-Oh)
- `scryfallId`: lowercase "set/number" (Magic)
- Felder die nicht relevant sind → `null`

## Schritt 2 — Benchmark ausführen

```bash
cd benchmark
SUPABASE_URL=https://xxx.supabase.co \
SUPABASE_ANON_KEY=eyJ... \
SUPABASE_USER_TOKEN=eyJ... \
npx ts-node run-benchmark.ts
```

**User Token holen** (einmalig einloggen):
```bash
curl -X POST https://xxx.supabase.co/auth/v1/token?grant_type=password \
  -H "apikey: ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"deine@email.com","password":"deinPasswort"}'
```

## Schritt 3 — Ergebnisse analysieren

Falls `/scan-benchmark analyze` aufgerufen wird:

1. Lese `benchmark/results.json`
2. Analysiere folgende Fragen:
   - Welche Karten-Typen (pokemon/yugioh/magic) haben die schlechteste Accuracy?
   - Welches Feld schlägt am häufigsten fehl (Name, Nummer, Passcode, Set)?
   - Gibt es Muster bei den Fehlern? (z.B. immer falsche Set-Codes bei Magic)
   - Ist der AI Confidence Score ein guter Indikator für tatsächliche Korrektheit?
   - Ausreißer: Karten mit hohem Confidence aber falschem Ergebnis?
3. Gib konkrete Empfehlungen für den System Prompt oder die Lookup-Logik
4. Vergleiche falls zwei results.json vorhanden (GPT-4o vs Claude)

## Score-Bedeutung

| Score | Bedeutung |
|---|---|
| 6/6 | Perfekt — alle Felder korrekt |
| 4-5/6 | Partial — Hauptfelder ok, Details falsch |
| <4/6 | Wrong — grundlegende Fehler |

**Gewichtung der Checks:**
- `name` + `tcgType` — kritisch (Grundidentifikation)
- `passcode` (YGO) / `cardNumber` (Pokemon) / `scryfallId` (Magic) — kritisch (API Lookup)
- `setName` — wichtig (Fallback Matching)

## Vergleich zweier Modelle (GPT-4o vs Claude)

Falls `/scan-benchmark compare` aufgerufen wird:

1. Prüfe ob `benchmark/results-gpt4o.json` und `benchmark/results-claude.json` existieren
2. Vergleiche Accuracy, Latenz und Fehlertypen
3. Empfehle das bessere Modell mit Begründung

Um zwei Läufe zu vergleichen:
```bash
# Lauf 1 (GPT-4o, Standard)
npx ts-node run-benchmark.ts
cp results.json results-gpt4o.json

# Wechsel auf Claude in ai-scan/index.ts, dann:
npx ts-node run-benchmark.ts
cp results.json results-claude.json

# Dann: /scan-benchmark compare
```
