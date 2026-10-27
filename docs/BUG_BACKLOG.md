# VaultCollector — Bug Backlog

Stand: 2026-03-24

---

## Kritisch (vor Production)

| # | Bug | Datei | Status |
|---|-----|-------|--------|
| 3 | **AI Scan: Accuracy-Verbesserung** — (a) Prompt optimiert mit Few-Shot, Verification Rules, "Fakten vor Vermutungen", visualDescription, detail:high (b) Confidence-Scoring umgebaut: Passcode/scryfallId-Match → 90+, Name+Number → 85+ (c) Fallback: 400-Error-Handling, Name-Cleaning, Magic Secondary Lookup (d) Image-Qualität: 1024px/85% statt 800px/70% (e) Quality Gates in VISION.md definiert. **Noch offen:** Accuracy mit 50+ Karten messen nach Deploy | `ai-scan/index.ts` / `ScanConfidence.ts` / `ScanScreen.tsx` / `ImageUtils.ts` | In Arbeit — Testing ausstehend |
| 11 | **Kein nachträgliches Bild hinzufügen** — Wenn ein Item ohne Bild gespeichert wird (z.B. durch Scan-Bug), kann der User kein Bild nachträglich setzen. **Lösung:** "Bild ändern" Button im EditItemScreen → Karte per Name in API suchen → API-Bild auswählen → `image_url` updaten. Nur API-Bilder (kein Upload), keine Storage-Kosten. | `EditItemScreen.tsx` | Feature — Offen |

## Mittel (sollte gefixt werden)

| # | Bug | Datei | Status |
|---|-----|-------|--------|
| 4 | ~~`useSyncPrices` Type hat `results` Feld das der Server nie zurückgibt~~ | `useSyncPrices.ts` | Behoben |
| 5 | ~~Magic card-search: Edge Function Type hatte kein `setVersions` Feld~~ | `card-search/index.ts` | Behoben |
| 6 | ~~GPT-4o erkennt manchmal falschen Set-Code → scryfallId Lookup schlägt fehl~~ | `ai-scan` + `ScanScreen.tsx` | Merged in #3 |
| 7 | ~~Veralteter TODO Kommentar "track usage per month" obwohl `scan_usage` Table existiert~~ | `ai.service.ts` | Behoben |

## Niedrig (Nice to Have)

| # | Bug | Datei | Status |
|---|-----|-------|--------|
| 8 | Edge Functions nutzen `console.error` für OpenAI Fehler statt strukturiertem Logging | `ai-scan/index.ts`, `artwork-match/index.ts` | Won't Fix |
| 9 | ~~Magic Suche: doppelter API-Call (Edge Function + Fallback Scryfall) → Latenz~~ | `CardSearchFactory.ts` | Behoben |
| 10 | ~~Scryfall Enrichment gibt sporadisch 400 Error (vermutlich Rate Limiting)~~ | `CardSearchFactory.ts` | Behoben (durch Fix #9) |

## Bereits gefixt

| # | Bug | Fix | Commit |
|---|-----|-----|--------|
| ✅ | `.DS_Store` in Git committed, fehlt in `.gitignore` | `.gitignore` + `git rm --cached` | 25da7c0 |
| ✅ | Hardcoded Version "v1.0.0" | Dynamisch via `expo-constants` | 25da7c0 |
| ✅ | `jsonResponse()` doppelt-gewrappt → AI Scan gab leere Felder zurück | Wrapper `{ data: ... }` entfernt | e8e13b7 |
| ✅ | `CardSearchResponse` Type hatte alten `data.data.results` Pfad | Type flattened auf `results` | e8e13b7 |
| ✅ | Android Splash Screen: Text abgeschnitten, Icon zu klein | Responsive Icon + paddingHorizontal | e8e13b7 |
| ✅ | VariantSelectorSheet: Statusbar Überlappung | `presentationStyle="fullScreen"` + `edges` | fbd83c8 |
| ✅ | Artwork-Auswahl resettet beim Version-Wechsel | Carousel `onLayout` scrollToIndex | d47d623 |
| ✅ | ItemDetailScreen: kein Error State | `ErrorView` mit Retry hinzugefügt | 3a27f8a |
| ✅ | ai-scan + price-sync: duplizierter Auth-Code | Refactored auf `authenticateRequest()` | fbd83c8 |
| ✅ | Kein Offline-Modus | MMKV + TanStack Query Persistence + OfflineBanner | 63bf0bf |
| ✅ | Kein Rate Limiting auf ai-condition/artwork-match | Shared `rateLimit.ts` Middleware | 34b5eb0 |
| ✅ | CSV Export versprochen aber nicht gebaut | `csvExport.ts` + ProfileScreen Button | 3a27f8a |
| ✅ | Magic: kein Artwork-Support im AI Scan | `ScryfallSearch.getById()` enriched + ScanScreen erweitert | d47d623 |
| ✅ | AI Scan: Button-Mehrfach-Trigger (5x gespeichert) | Lokaler `isSaving` State, sofort disabled | 5c26729 |
| ✅ | Scan-Counter 0/5 aktualisiert nicht nach Scan | `invalidateQueries(["scanUsage"])` nach Scan | 6d254ee |
| ✅ | Email Confirmation Flow broken | `verifyOtp` + `emailRedirectTo` + Error/Success Toasts | 88d98d4 |
| ✅ | Auth Fehler auf Englisch (Supabase raw errors) | Error-Mapping auf i18n Keys (6 Fehlertypen) | 88d98d4 |
| ✅ | Kein Confirm-Password bei Registrierung | Zweites PW-Feld + Match-Validierung | b406174 |
| ✅ | Kein Passwort-Vergessen | `resetPasswordForEmail` + Toast | b406174 |
| ✅ | HomeScreen Header ohne visuelle Abgrenzung | GlassCard-Style mit Border + Radius | 0b50016 |
| ✅ | Empty State CTA nicht prominent genug | Blauer "Sammlung erstellen" Button | 0b50016 |
| ✅ | Vault versteckt für neue User | Vault-Hint-Card auf HomeScreen wenn 0 Standorte | e9b4c2b |
| ✅ | KI-Scan Fortschrittsbalken fehlt im Profil | Orange Progress Bar für Scan-Usage | bd41d60 |
| ✅ | Vault Icon-Picker ohne Labels (Emojis unklar) | 2-Spalten Grid mit Lucide Icons + i18n Labels | bf6d361 |
| ✅ | Account löschen: Button mehrfach klickbar | Loading-State + disabled Button | (user fix) |
| ✅ | Abmelden: Kein Bestätigungs-Sheet | ConfirmSheet mit Loading-State | (user fix) |
| ✅ | AI Scan: Bilder fehlen nach Speichern | Debug-Logging + Scryfall Fix, Bilder jetzt sichtbar | 743449b |
| ✅ | AI Scan Save: Keine Sammlung → User stuck | "Sammlung erstellen" Button im Sheet, kein zweiter Scan | f3e3f8d |
| ✅ | Onboarding: Kein Setup für neue User | Gelöst durch bestehende CTAs auf HomeScreen | 4c7fb33 |
| ✅ | YGO Confidence zu niedrig bei korrektem Passcode | +20 Bonus bei Passcode-Match | 743449b |
| ✅ | HomeScreen: Magic unsichtbar bei 0 Items | Alle 3 TCG-Typen immer anzeigen | (user fix) |

---

## Nicht-Bugs (bekannte Limitierungen)

| # | Limitierung | Grund | Phase |
|---|-------------|-------|-------|
| 1 | Apple/Google Sign-In fehlt | Braucht Apple Dev Account ($99/Jahr) | Pre-Launch |
| 2 | Sentry DSN nicht konfiguriert | Braucht Sentry Account | Pre-Launch |
| 3 | RevenueCat nicht konfiguriert | Braucht Apple Dev + Store Products | Pre-Launch |
| 4 | `--no-verify-jwt` auf Edge Functions | `sb_publishable_` Keys inkompatibel mit Gateway JWT | Supabase-Bug |
| 5 | Pokemon API nur Englisch | API-Limitation, kein DE→EN Mapping | Phase 2 |
| 6 | Kein Price Sync Cron | Braucht Supabase Pro Plan ($25/Mo) für pg_cron | Phase 2 |
| 7 | Magic Link Deep Linking ungetestet | Email Rate Limiting verhindert Test | Pre-Launch |
