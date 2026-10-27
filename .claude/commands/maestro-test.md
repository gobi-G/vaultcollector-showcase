# Maestro E2E Test

Erstelle einen Maestro E2E Test für einen Screen oder Feature. Das Argument ist der Screen-Name (z.B. `/maestro-test ScanScreen`).

## Schritte

1. **Lese** den Screen-Code in `apps/mobile/src/screens/`
   - Identifiziere alle interaktiven Elemente und ihre testIDs
   - Verstehe den User-Flow (was macht der User Schritt für Schritt?)
   - Identifiziere mögliche Error- und Edge-Cases

2. **Prüfe** ob alle interaktiven Elemente testIDs haben:
   - Buttons, Inputs, Pressables, Touchables brauchen `testID`
   - Naming: kebab-case mit Screen-Prefix (z.B. `scan-capture-btn`)
   - Falls testIDs fehlen: füge sie im Screen-Code hinzu

3. **Erstelle** `maestro/<feature-name>.yaml`:

```yaml
appId: com.vaultcollector.app
---
- launchApp
# Navigation zum Screen (falls nötig)
- tapOn:
    id: "tabs-<tab>"
# Happy Path Steps
- tapOn:
    id: "<screen>-<element>-btn"
# Assertions
- assertVisible:
    id: "<screen>-<result>"
```

4. **Decke mindestens ab:**
   - Happy Path (normaler Erfolgsfall)
   - Error State (was passiert bei Fehler?)
   - Empty State (falls zutreffend)
   - Loading State (falls sichtbar)

## Maestro Regeln
- Immer `launchApp` am Anfang
- Immer `assertVisible` am Ende
- Nur `id:` für Element-Selektion — nie `text:` allein
- `inputText` braucht immer eine `id`
- Für Netzwerk-abhängige Tests: realistische Test-Daten verwenden
- File-Naming: `kebab-case.yaml` (z.B. `ai-scan.yaml`, `add-item.yaml`)

## Bestehende Tests als Referenz
Schaue in `maestro/` für bestehende Tests als Stil-Referenz.
