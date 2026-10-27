---
paths:
  - "apps/mobile/**"
---

# Performance

- Lazy load screens with Expo Router
- Use FlashList instead of FlatList for long lists
- Memoize expensive computations with useMemo
- Use React.memo sparingly — only for proven bottlenecks
- Image optimization: resize before upload with expo-image-manipulator
- Minimize re-renders: keep state close to where it's used
- expo-image with blurhash placeholders for ALL remote images — no layout shifts
