# Add Collection Category

Füge eine neue Sammler-Kategorie hinzu (z.B. `/add-category comics` oder `/add-category vinyl`).

## Architektur verstehen
Das System nutzt ein Discriminated Union Pattern auf `category`:
- `packages/shared/src/schemas/categories/` — ein Schema pro Kategorie
- `ItemSchema` in shared ist eine `z.discriminatedUnion("category", [...])`
- DB speichert `category` (text) + `metadata` (jsonb)
- Neue Kategorie = neues Schema + Union erweitern + Provider + UI

## Schritte

### 1. Zod Schema (packages/shared)
- Erstelle `packages/shared/src/schemas/categories/<name>.ts`
- Definiere alle kategorie-spezifischen Felder als Zod-Schema
- Exportiere `<Name>MetadataSchema` und `<Name>ItemSchema`
- Beispiel für neue Kategorie "Comics":
```typescript
export const ComicsMetadataSchema = z.object({
  publisher: z.string(),
  issue_number: z.string(),
  series: z.string(),
  grade: z.string().optional(),
  grading_company: z.enum(["CGC", "CBCS", "PGX"]).optional(),
});
```

### 2. Discriminated Union erweitern
- Öffne `packages/shared/src/schemas/items.ts`
- Importiere das neue Schema
- Füge neuen Literal-Branch zur `z.discriminatedUnion` hinzu
- Prüfe ob `CategoryEnum` aktualisiert werden muss

### 3. Supabase Provider
- Erstelle `supabase/providers/<name>.provider.ts`
- Interface: `supabase/providers/interfaces/I<Name>Provider.ts`
- Implementiert: Suche nach Karten/Items per Name/Barcode/ID
- API-Keys aus Environment Variables

### 4. AI Scan Support (supabase/functions/ai-scan)
- Erweitere den System-Prompt um die neue Kategorie
- Füge kategorie-spezifische Felder zum Output-Schema hinzu
- Aktualisiere den Confidence-Scoring in `apps/mobile/src/utils/ScanConfidence.ts`

### 5. Mobile UI

**Service Interface:**
- Falls nötig: erweitere `src/services/interfaces/` um neue Methoden

**TanStack Query Hook:**
- Erstelle `src/hooks/queries/use<Name>Search.ts`

**AddItemScreen / ScanScreen:**
- Neue Kategorie in Kategorie-Picker aufnehmen
- Kategorie-spezifische Metadata-Felder im Formular hinzufügen

**i18n:**
- Füge `category.<name>` Key zu ALLEN 4 Locale-Dateien hinzu
- Alle neuen UI-Strings ebenfalls in alle 4 Sprachen

### 6. Maestro Test
- Erstelle `maestro/add-<name>-item.yaml`
- Teste den kompletten Add-Flow für die neue Kategorie

## Checkliste
- [ ] Zod Schema in shared erstellt
- [ ] Discriminated Union erweitert
- [ ] Typen kompilieren ohne Fehler
- [ ] Supabase Provider erstellt
- [ ] AI Scan unterstützt neue Kategorie
- [ ] Mobile UI zeigt neue Kategorie
- [ ] i18n Keys in allen 4 Sprachen
- [ ] Maestro Test erstellt
- [ ] Bestehende Tests laufen noch durch

## Regel
Keine bestehenden Dateien müssen gebrochen werden — das Discriminated Union Pattern ist darauf ausgelegt, erweiterbar zu sein.
