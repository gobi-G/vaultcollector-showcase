# Bug Fix

Lese `docs/BUG_BACKLOG.md` und finde den nächsten offenen Bug (Status "Offen" oder "In Arbeit").

Führe dann folgende Schritte durch:

1. **Analysiere** alle betroffenen Dateien die im Backlog genannt sind — lese sie vollständig
2. **Verstehe** das Problem und den gewünschten Fix
3. **Fixe** den Bug — halte dich an die Coding Standards aus CLAUDE.md:
   - TypeScript strict, kein `any`
   - NativeWind statt StyleSheet.create
   - i18n für alle User-facing Strings (alle 4 Sprachen)
   - Clean Architecture: kein direkter Supabase-Import in Screens
   - Shared Types aus `@vault-collector/shared`
4. **Aktualisiere** `docs/BUG_BACKLOG.md`: setze den Status auf "Behoben"
5. **Gib** eine kurze Zusammenfassung was du geändert hast und warum

Falls ein Argument übergeben wurde (z.B. `/bug 11`), fixe genau diesen Bug nach seiner Nummer.
