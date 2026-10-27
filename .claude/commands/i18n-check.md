# i18n Check

Prüfe alle 4 Locale-Dateien auf fehlende oder inkonsistente Übersetzungskeys.

## Schritte

1. **Lese** alle 4 Locale-Dateien:
   - `apps/mobile/src/i18n/locales/en.json` (Referenzsprache)
   - `apps/mobile/src/i18n/locales/de.json`
   - `apps/mobile/src/i18n/locales/fr.json`
   - `apps/mobile/src/i18n/locales/es.json`

2. **Vergleiche** alle Keys gegen `en.json` als Referenz:
   - Welche Keys fehlen in DE, FR oder ES?
   - Welche Keys existieren in DE/FR/ES aber nicht in EN (verwaiste Keys)?
   - Welche Values sind noch englisch (Placeholder, nicht übersetzt)?

3. **Zeige** das Ergebnis als übersichtliche Liste:
   ```
   Fehlende Keys:
   - de: screen.foo.bar, screen.foo.baz
   - fr: screen.foo.bar
   - es: (vollständig)

   Verwaiste Keys (nicht in EN):
   - de: old.key.xyz
   ```

4. **Frage** ob du die fehlenden Keys automatisch ergänzen sollst.
   - Falls ja: übersetze sinngemäß in die jeweilige Sprache
   - Verwende denselben Nested-Key wie in EN
   - Füge die Keys an der richtigen Stelle in der JSON-Struktur ein

## Regeln
- EN ist immer die Referenz — nie EN anpassen
- Keine maschinellen Übersetzungen die falsch klingen — lieber Placeholder markieren mit `"[TODO: translate]"`
- JSON-Struktur muss valide bleiben
