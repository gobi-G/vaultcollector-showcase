---
paths:
  - "supabase/**"
---

# Backend Architecture

4-layer architecture — each layer only knows the one below it:
```
Edge Functions (HTTP) → Services (Logic) → Providers (APIs) + Repositories (DB)
```

## Structure
```
supabase/
├── functions/          → HTTP handlers (Edge Functions), thin, no logic
│   └── _shared/        → CORS, auth middleware, response helpers, errors
├── services/           → Business logic, orchestration, limits
├── providers/          → External API adapters (Pokemon TCG, OpenAI, eBay)
│   └── interfaces/     → Provider contracts (IPriceProvider, IAiProvider)
├── repositories/       → Database access ONLY
├── config/             → Environment variables
├── types/              → Re-exports from @vault-collector/shared
├── migrations/         → SQL schema migrations
└── config.toml         → Supabase CLI config
```

## Rules
- Edge Functions are THIN — validate input, call service, return response
- Services contain ALL business logic — tier limits, aggregation, orchestration
- Providers are SWAPPABLE — interface first, implementation second
- Repositories are the ONLY layer that touches the database
- Services receive providers via dependency injection (factory functions)
- NEVER import a provider directly in an Edge Function — always go through a service
- Backend uses `@vault-collector/shared` types via `supabase/types/index.ts`
- Use Zod schemas from shared for request validation in Edge Functions
- Deploy Edge Functions with: `supabase functions deploy <name> --project-ref <ref>`

## Supabase
- Row-Level Security (RLS) on every table — no exceptions
- Use migrations for all schema changes — never manual SQL in dashboard
- Edge Functions in TypeScript (Deno)

## API
- All API calls go through Supabase Edge Functions — never call external APIs from client
- API keys NEVER in client code — always in Edge Functions
- Cache aggressively: 1h for prices, 24h for card data
- Always handle errors with proper user feedback
- Use Zod for request/response validation in both client and Edge Functions
