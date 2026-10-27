# New Screen

Erstelle einen neuen Screen für VaultCollector. Das Argument ist der Screen-Name (z.B. `/new-screen EditItem`).

Führe folgende Schritte durch — in genau dieser Reihenfolge:

## 1. Shared Types (falls nötig)
- Prüfe ob relevante Zod-Schemas in `packages/shared/src/` existieren
- Falls nicht: Schema zuerst definieren, Typen via `z.infer<>` ableiten

## 2. TanStack Query Hook
- Erstelle `apps/mobile/src/hooks/queries/use<Name>.ts`
- Wrapping von Repository-Calls (nie direkt Supabase)
- Query + Mutations in derselben Datei
- Nach Mutations immer `invalidateQueries` aufrufen

## 3. Screen Component
- Erstelle `apps/mobile/src/screens/<category>/<Name>Screen.tsx`
- Named Export (kein default export)
- NativeWind className — kein StyleSheet.create
- SafeAreaView als top-level Container
- Loading, Error und Empty State behandeln
- Alle Strings via `t("key")` — kein hardcoded Text
- testID auf allen interaktiven Elementen (kebab-case mit Screen-Prefix)
- accessibilityLabel auf allen Touchable-Elementen

## 4. Expo Router Page
- Erstelle `apps/mobile/app/<route>.tsx`
- Nur ein 1-Liner Re-Export des Screen-Components
- Default export (Expo Router Ausnahme)

## 5. i18n Keys
- Füge alle neuen Keys zu ALLEN 4 Locale-Dateien hinzu:
  - `apps/mobile/src/i18n/locales/en.json`
  - `apps/mobile/src/i18n/locales/de.json`
  - `apps/mobile/src/i18n/locales/fr.json`
  - `apps/mobile/src/i18n/locales/es.json`
- Verwende nested Keys: `screen-name.title`, `screen-name.empty`, etc.

## 6. Maestro E2E Test
- Erstelle `maestro/<screen-name>.yaml`
- Happy Path + mindestens einen Error/Edge Case
- Nur `id:` für Element-Selektion (testID), nie Text-Matching
- Startet mit `launchApp`, endet mit `assertVisible`

## Regeln
- Datei max. 200 Zeilen — bei Bedarf aufteilen
- Kein `console.log`
- Keine direkten Imports aus `services/implementations/` — immer `@/services`
- expo-image statt React Native Image, immer mit blurhash Placeholder
- `className` prop für Styles — keine inline style objects (`style={{ ... }}`)
- Offline-Verhalten definieren: was passiert ohne Internet? (MMKV Cache, OfflineBanner, deaktivierte Aktionen)
