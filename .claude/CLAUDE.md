# VaultCollector — Claude Coding Guidelines

## Project Overview
Smart Inventory Tracker for collectors (TCG cards, LEGO, watches). Monorepo with Turborepo + pnpm.

## Monorepo Structure
```
apps/mobile/        → React Native (Expo) — Main user app
apps/web/           → Next.js (later) — User web app
apps/admin/         → Next.js (later) — Admin dashboard
packages/shared/    → SINGLE SOURCE OF TRUTH for types, validation, API client
supabase/           → Supabase Edge Functions, migrations, seeds, services, providers
maestro/            → E2E test flows
docs/               → Project documentation
```

## Tech Stack
- **Mobile:** React Native, Expo, Expo Router, NativeWind (Tailwind)
- **UI Components:** gluestack-ui
- **Server State:** TanStack Query (React Query)
- **Client State:** Zustand (only when needed)
- **Offline:** MMKV
- **Camera/Scan:** react-native-vision-camera + MLKit
- **Backend:** Supabase (Auth, PostgreSQL, Edge Functions, Storage)
- **AI:** OpenAI GPT-4o (Vision) + Claude (Text/Analysis)
- **Payments:** RevenueCat
- **E2E Testing:** Maestro
- **Web UI (later):** HeroUI + Tailwind CSS

## General Coding Standards
- TypeScript strict mode everywhere — no `any`, no `@ts-ignore`
- Use shared types from `@vault-collector/shared` — NEVER duplicate types
- Path alias `@/` points to `src/` — use `@/components/ui` not `../../components/ui`
- Functional components only — no class components
- Use named exports — no default exports (except Expo Router pages)
- File naming: `PascalCase.tsx` for components/services/providers, `camelCase.ts` for hooks, `kebab-case` for Expo Router pages in `app/`, lowercase for config/utility files
- Keep files under 200 lines — split if larger
- No console.log in production code — use a logger utility
- Exception for `any`: third-party libs with bad types — put augmentations in `src/types/vendor.d.ts`

## Git & Workflow
- Branch naming: `feature/short-description`, `fix/short-description`
- Commit messages: imperative mood, concise (e.g., "Add barcode scanner screen")
- No co-author tags in commits
- Every feature branch gets a PR — no direct pushes to main
- PR must include: what changed, why, how to test

## Security
- Supabase RLS on every table
- Validate all user input with Zod
- No sensitive data in AsyncStorage/MMKV — use Supabase Auth tokens
- API keys only in Edge Functions
- Rate limit AI features per user tier

## Common Commands
- `pnpm install` — Install dependencies
- `pnpm dev` — Start mobile dev server (Expo)
- `supabase functions serve` — Local Edge Functions
- `supabase db push` — Apply migrations
- `supabase functions deploy <name> --project-ref <ref>` — Deploy Edge Function
- `maestro test maestro/` — Run E2E tests
- `deno test --allow-env --allow-net` — Run backend tests

## Environment
- Mobile: `apps/mobile/.env` (EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY)
- Edge Functions: `supabase/.env` (OPENAI_API_KEY, etc.)
- Never commit .env files
