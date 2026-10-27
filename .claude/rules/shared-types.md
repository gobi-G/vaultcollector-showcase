---
paths:
  - "packages/shared/**"
  - "supabase/types/**"
---

# Shared Types — Single Source of Truth

`@vault-collector/shared` is the SINGLE source of truth for all shared code.
Consumed by: mobile, web (later), admin (later), and backend.

## What goes in shared
- Zod validation schemas — define schema FIRST, then derive types
- Database types via `z.infer<typeof Schema>` — never duplicate manually
- API request/response types
- Enums and constants (ItemCondition, SubscriptionTier, PriceSource)
- Shared utility functions (formatting, calculations)

## Zod-first approach
```typescript
// CORRECT: Schema first, type derived
export const ItemSchema = z.object({ name: z.string(), ... });
export type Item = z.infer<typeof ItemSchema>;

// WRONG: Manual type that duplicates schema
export interface Item { name: string; ... }
```

## Discriminated Union Pattern (Category System)
Items use a discriminated union on `category` to support multiple collection types:
```typescript
// Category-specific metadata schemas in shared/schemas/categories/
const TcgMetadataSchema = z.object({ card_api_id, set_name, rarity, ... });
const LegoMetadataSchema = z.object({ set_number, theme, pieces, sealed, ... });
const WatchMetadataSchema = z.object({ brand, model, movement, ... });

// Discriminated union — TypeScript narrows automatically
const ItemSchema = z.discriminatedUnion("category", [
  BaseItemSchema.extend({ category: z.literal("tcg"), metadata: TcgMetadataSchema }),
  BaseItemSchema.extend({ category: z.literal("lego"), metadata: LegoMetadataSchema }),
  BaseItemSchema.extend({ category: z.literal("watch"), metadata: WatchMetadataSchema }),
]);

// Usage: if (item.category === "tcg") → item.metadata.rarity is typed
```
- DB stores `category` (text) + `metadata` (jsonb) on items table
- Adding a new category = new schema in `categories/`, extend the union, add provider
- No existing code needs to change

## Rules
- NEVER duplicate a type that exists in shared — import it
- When adding a new DB table or API endpoint, define Zod schema in shared FIRST
- Backend Edge Functions and mobile app must use the SAME types from shared
- Import as: `import { Item, ItemCondition } from "@vault-collector/shared"`

## Deno / Edge Functions linking
- Backend (Deno) imports shared types via relative path: `../../packages/shared/src/types.ts`
- No NPM publishing needed — Turborepo workspace linking handles resolution
- If Deno resolution breaks, use Import Maps in `deno.json` to alias the shared package
