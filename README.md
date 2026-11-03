# VaultCollector

[![CI](https://github.com/gobi-G/vaultcollector-showcase/actions/workflows/ci.yml/badge.svg)](https://github.com/gobi-G/vaultcollector-showcase/actions/workflows/ci.yml)

Smart inventory tracker for collectors. Point the camera at a trading card and VaultCollector identifies it, finds the exact printing and tracks its value.

Built solo with React Native/Expo and Supabase, using an AI-first workflow (Claude Code with custom agents, rules and commands in [`.claude/`](.claude)).

## Highlights

- **AI card scanning:** Photo → GPT-4o Vision extracts name, set, number, edition and condition → lookup in the Pokémon TCG, Yu-Gi-Oh! and Scryfall (Magic) APIs → artwork matching when a card has several printings
- **Scan quality:** Image validation (brightness, sharpness, size) before upload, deterministic prompts (`temperature: 0`), a ground-truth benchmark screen to measure recognition accuracy, and confidence-based suggestion pickers
- **Cost control:** Per-user scan quotas and a global daily AI budget enforced in the backend
- **Privacy:** GDPR consent before any image is sent to an AI provider, account deletion via Edge Function
- **Monetization:** Freemium paywall with RevenueCat
- **Price tracking:** Price sync for collection items via Edge Function
- **i18n:** German, English, French and Spanish
- **E2E tests:** Maestro flows for onboarding, auth, collections, scanning, paywall and more

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native, Expo, Expo Router, react-native-vision-camera |
| Styling | NativeWind (Tailwind CSS) |
| State | TanStack Query (server), Zustand (client) |
| Shared | Zod schemas and types in `packages/shared` |
| Backend | Supabase: Postgres with RLS, Auth, Storage, Edge Functions (Deno) |
| AI | OpenAI GPT-4o Vision, Claude |
| Payments | RevenueCat |
| Testing | Vitest, Jest, Deno tests, Maestro (E2E), GitHub Actions |
| Tooling | pnpm workspaces, Turborepo, ESLint, Prettier |

## Architecture

```
apps/mobile/        React Native (Expo) app
packages/shared/    Single source of truth: Zod schemas, types, validation
supabase/           Edge Functions, migrations, services, providers, repositories
maestro/            E2E test flows
docs/               How-to docs (AI scan pipeline)
```

**Mobile (clean architecture):** Screens → TanStack Query hooks → service interfaces → implementations. The backend can be swapped by changing one file (`src/services/index.ts`).

**Backend (target: 4 layers):** Edge Functions (HTTP) → services (logic) → providers (external APIs) + repositories (DB), each layer only knowing the one below it. `ai-condition` is built fully on these layers. The earlier functions (`ai-scan`, `card-search`, `price-sync`, `delete-account`) still call external APIs and the database directly and are being migrated one at a time; their pure logic (card number normalisation, price and image mapping) already lives in I/O-free modules with unit tests.

**Edge Functions:** `ai-scan`, `ai-condition`, `artwork-match`, `card-search`, `price-sync`, `delete-account`

How the AI scan works end to end (German): [docs/howto/AI_SCAN.md](docs/howto/AI_SCAN.md)

## Testing

| Layer | Tooling | Run |
|-------|---------|-----|
| Shared schemas and business rules | Vitest | `pnpm test` |
| Mobile utilities (scan confidence scoring) | Jest | `pnpm test` |
| Edge Function logic, services, providers | Deno test | `cd supabase && deno test --allow-env --allow-net` |
| User flows on a simulator | Maestro | `pnpm e2e` |

[GitHub Actions](.github/workflows/ci.yml) runs lint, typecheck and all unit tests on every push and pull request.

## Known Limitations

- Pokémon card search runs directly from the app against the public Pokémon TCG API to keep the MVP simple. It moves behind the `card-search` Edge Function before launch.
- Card search matches English card names only; a multilingual name mapping is planned.

## Getting Started

Prerequisites: Node.js 22+, pnpm 10+, Deno 2+, a Supabase project.

```bash
pnpm install

cp apps/mobile/.env.example apps/mobile/.env.development
cp supabase/.env.example supabase/.env.development
# fill in your Supabase, OpenAI and RevenueCat keys

pnpm mobile:dev
```

| Command | Description |
|---------|------------|
| `pnpm mobile:dev` | Start Expo dev server |
| `pnpm mobile:ios` / `pnpm mobile:android` | Run on simulator / emulator |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | Type check all packages |

## About This Repository

This is a curated portfolio snapshot of a private repository, so the development history is not included.

## License

All rights reserved. The code is published for portfolio purposes; please don't reuse it without permission.
