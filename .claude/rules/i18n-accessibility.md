---
paths:
  - "apps/mobile/src/i18n/**"
  - "apps/mobile/src/screens/**"
  - "apps/mobile/src/components/**"
---

# Internationalization (i18n)

- ALL user-facing text MUST use translation keys — no hardcoded strings
- Use `useTranslation()` hook: `const { t } = useTranslation()`
- Languages: DE, EN, FR, ES — fallback: EN
- Translation files: `i18n/locales/{en,de,fr,es}.json`
- Use nested keys: `t("portfolio.title")`, `t("condition.mint")`
- Use interpolation for dynamic values: `t("collection.itemCount", { count: 50 })`
- When adding a new feature, add keys to ALL 4 locale files
- Device language is auto-detected via expo-localization

# Accessibility

- Every touchable element needs an `accessibilityLabel`
- Support Dynamic Type (font scaling)
- Minimum touch target: 44x44 points
- Test with VoiceOver (iOS) before release
