# Do NOT

- Use `any` type (except in `vendor.d.ts` for type augmentation)
- Use `StyleSheet.create` — use NativeWind
- Call external APIs from client — use Edge Functions
- Skip Maestro E2E tests for new features
- Use default exports (except Expo Router pages)
- Add console.log to committed code
- Skip error/loading/empty states
- Hardcode strings — use i18n keys (`t("key")`) for ALL user-facing text
- Skip RLS on Supabase tables
- Import from `services/implementations/` directly — always use `@/services`
- Define types manually when a Zod schema exists — use `z.infer<typeof Schema>`
- Use repositories directly in screens — wrap in TanStack Query hooks in `hooks/queries/`
- Show images without a placeholder — always use blurhash or skeleton
