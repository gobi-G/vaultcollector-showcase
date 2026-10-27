# How It Works: AI Scan

Stand: Maerz 2026

---

## Ueberblick

Der AI Scan erkennt Trading Cards per Smartphone-Kamera. Der User fotografiert eine Karte, GPT-4o Vision analysiert das Bild und extrahiert Metadaten (Name, Set, Nummer, Zustand). Danach wird die Karte in einer externen API gesucht um Bild, Preis und Versionen zu laden.

---

## Flow (Schritt fuer Schritt)

```
User drueckt Kamera-Button
    |
    v
[1] Foto aufnehmen (react-native-vision-camera)
    |
    v
[2] Bild validieren (Helligkeit, Schaerfe, Groesse)
    |
    v
[3] Bild zuschneiden & komprimieren (800px, JPEG 80%)
    |
    v
[4] Base64 an Edge Function senden (ai-scan)
    |
    v
[5] GPT-4o Vision analysiert Bild → JSON mit Metadaten
    |
    v
[6] Card Lookup per TCG-Typ:
    ├── Pokemon:  searchByNameAndNumber()
    ├── Yu-Gi-Oh: getById(passcode)
    └── Magic:    getById(scryfallId)
    |
    v
[7] Artwork Matching (nur bei mehreren Artworks)
    |
    v
[8] Confidence berechnen
    |
    v
[9] Scan-Ergebnis anzeigen
    |
    v
[10] User drueckt "Zur Sammlung hinzufuegen"
    |
    v
[11] Item in Supabase speichern
```

---

## Beteiligte Dateien

| Datei | Aufgabe |
|-------|---------|
| `screens/scan/ScanScreen.tsx` | Orchestriert den gesamten Flow |
| `supabase/functions/ai-scan/index.ts` | GPT-4o Vision Edge Function |
| `services/.../SupabaseAiScan.ts` | Client fuer ai-scan Edge Function |
| `services/.../YgoProSearch.ts` | Yu-Gi-Oh Card Lookup (Passcode) |
| `services/.../ScryfallSearch.ts` | Magic Card Lookup (scryfallId) |
| `services/.../PokemonTcgSearch.ts` | Pokemon Card Lookup (Name+Number) |
| `services/.../SupabaseArtworkMatch.ts` | Artwork Matching via GPT-4o |
| `utils/ScanConfidence.ts` | Confidence Score Berechnung |
| `components/features/ScanResultView.tsx` | Ergebnis-Anzeige |
| `components/features/ScanSaveSheet.tsx` | Speichern-Dialog |

---

## Schritt 1-3: Foto aufnehmen & verarbeiten

**ScanScreen.tsx**

1. `react-native-vision-camera` macht ein Foto
2. Bild wird validiert: min. 200x200px, nicht zu dunkel
3. Bild wird zugeschnitten (Karten-Bereich) und komprimiert:
   - Breite: 800px
   - Format: JPEG 80% Qualitaet
   - Ergebnis: ~80-120KB Base64 String

---

## Schritt 4-5: GPT-4o Vision (Edge Function)

**supabase/functions/ai-scan/index.ts**

### Request
```json
{
  "image": "base64-encoded-jpeg..."
}
```

### Was GPT-4o macht
- Bekommt das Kartenbild als Base64
- Analysiert mit einem detaillierten Prompt (siehe unten)
- Gibt strukturiertes JSON zurueck

### GPT-4o Prompt (gekuerzt)
```
Du bist ein Experte fuer TCG-Karten (Pokemon, Yu-Gi-Oh, Magic).
Lese ALLE Text-Identifikatoren DIREKT vom Kartenbild.

POKEMON: Name + Suffix (ex, VMAX), Collector Number (XXX/YYY), HP, Set
YU-GI-OH: Passcode (8 Ziffern unten links), Set-Code, Edition
MAGIC: Collector Number, Set-Code (3 Buchstaben), konstruiere scryfallId
```

### Response
```json
{
  "name": "Dark Magician",
  "tcgType": "yugioh",
  "setName": "Legend of Blue Eyes",
  "cardNumber": "LOB-005",
  "rarity": "Ultra Rare",
  "confidence": 0.95,
  "estimatedCondition": "near_mint",
  "passcode": "46986414",
  "scryfallId": null,
  "hp": null,
  "variant": null,
  "language": "English"
}
```

### Scan-Zaehler
Nach erfolgreichem Scan wird `scan_usage` hochgezaehlt (async, blockiert nicht die Response). Limits: Free=5, Premium=50, Pro=Unbegrenzt pro Monat.

---

## Schritt 6: Card Lookup (per TCG-Typ)

### Pokemon
```
AI gibt: name="Charizard VMAX", number="020/189"
→ PokemonTcgSearch.searchByNameAndNumber("Charizard VMAX", "020/189")
→ Pokemon TCG API: https://api.pokemontcg.io/v2/cards?q=name:"Charizard VMAX"
→ Filtert nach Collector Number Match
→ Gibt Bild, Preis, Set zurueck
```

### Yu-Gi-Oh
```
AI gibt: passcode="46986414"
→ YgoProSearch.getById("46986414")
→ YGOPRODeck API: https://db.ygoprodeck.com/api/v7/cardinfo.php?id=46986414
→ Wenn nur 1 Artwork: Re-Fetch per Name fuer alle Artworks
→ Gibt Bild, Preis, Set-Versionen, Artworks zurueck
```

### Magic
```
AI gibt: scryfallId="blc/307"
→ ScryfallSearch.getById("blc/307")
→ Scryfall API: https://api.scryfall.com/cards/blc/307
→ Enriched mit Artworks (unique=art) und Printings (unique=prints)
→ Gibt Bild, Preis, Set-Versionen zurueck
```

### Fallback (wenn Lookup fehlschlaegt)
```
→ Name-Suche ueber card-search Edge Function
→ Fuzzy Match auf Set-Name
→ Erstes Ergebnis wird genommen
```

---

## Schritt 7: Artwork Matching

**SupabaseArtworkMatch.ts** + **supabase/functions/artwork-match/index.ts**

Nur bei Karten mit mehreren Artworks (z.B. Dark Magician hat 9 Artworks):

1. Das gescannte Foto wird nochmal an GPT-4o geschickt
2. Zusammen mit allen Artwork-URLs der Karte
3. GPT-4o vergleicht: "Welches Artwork passt zum Foto?"
4. Gibt Index + Confidence zurueck

```json
{ "matchedIndex": 3, "confidence": 0.95 }
```

Wenn Confidence < 0.7 → User bekommt Artwork-Selector zum manuellen Waehlen.

---

## Schritt 8: Confidence Berechnung

**ScanConfidence.ts**

Score von 0-100, basierend auf 4 Checks:

| Check | Punkte | Beschreibung |
|-------|--------|-------------|
| Name Match | +40 | AI-Name stimmt mit API-Name ueberein |
| ID Match | +30 | Passcode (YGO), scryfallId (Magic), CardNumber (Pokemon) |
| Set Match | +20 | Set-Name Wort-Ueberlappung |
| Bild vorhanden | +10 | API hat ein Bild zurueckgegeben |

**Bonus:** Bei Yu-Gi-Oh Passcode-Match +20 extra (zuverlaessigster Identifier)

**Level:**
- ≥80: "high" (gruener Badge)
- ≥50: "medium" (gelber Badge)
- <50: "low" (oranger Badge, "Unsicher — Version pruefen")

---

## Schritt 9: Ergebnis anzeigen

**ScanResultView.tsx**

Zeigt:
- Kartenbild (von API, nicht das gescannte Foto)
- Confidence Badge (80% Sicherheit)
- Kartenname, TCG-Typ, Rarity, Set
- Preis
- Geschaetzter Zustand
- "Falsche Version?" Link fuer Alternativen

---

## Schritt 10-11: Speichern

**ScanSaveSheet.tsx**

1. User waehlt Sammlung (oder erstellt eine)
2. User waehlt Zustand (Mint/NM/Played/Damaged)
3. Optional: Standort, Kaufpreis, Notizen
4. Duplikat-Check: Warnung wenn Karte schon in Sammlung
5. Item wird in Supabase `items` Tabelle gespeichert

```json
{
  "collection_id": "uuid",
  "name": "Dark Magician",
  "category": "tcg",
  "metadata": {
    "card_api_id": "46986414",
    "set_name": "Legend of Blue Eyes",
    "rarity": "Ultra Rare",
    "tcg_type": "yugioh"
  },
  "condition": "near_mint",
  "image_url": "https://images.ygoprodeck.com/...",
  "current_market_price": 25.20
}
```

---

## Kosten pro Scan

| Schritt | API | Kosten |
|---------|-----|--------|
| GPT-4o Vision (Erkennung) | OpenAI | ~0,01-0,03 USD |
| Card Lookup | Pokemon TCG / Scryfall / YGOPRODeck | Kostenlos |
| Artwork Matching | OpenAI | ~0,01 USD (nur bei mehreren Artworks) |
| **Gesamt** | | **~0,01-0,04 USD pro Scan** |

---

## Bekannte Limitierungen

| Problem | Grund | Workaround |
|---------|-------|-----------|
| Falscher Set-Code (z.B. "slc" statt "blc") | GPT-4o Limitation | Fallback auf Name-Suche |
| Nicht-englische Karten | APIs nur auf Englisch | GPT-4o uebersetzt ins Englische |
| Schlechte Fotos (dunkel, unscharf) | Kamera-Qualitaet | Validierung vor Scan, Hinweis an User |
| Confidence zu niedrig bei korrektem Ergebnis | Scoring-Algorithmus | Bonus fuer Passcode-Match |
