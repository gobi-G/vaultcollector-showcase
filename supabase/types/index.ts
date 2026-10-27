// Re-export shared types for backend use
// Backend uses the same types as frontend — single source of truth
export type {
  BaseItem,
  Category,
  Collection,
  CollectionInsert,
  CollectionUpdate,
  Item,
  ItemCondition,
  ItemInsert,
  ItemUpdate,
  Language,
  LegoItem,
  LegoMetadata,
  PriceHistory,
  PriceHistoryInsert,
  PriceSource,
  Profile,
  ProfileUpdate,
  SubscriptionTier,
  TcgItem,
  TcgMetadata,
  WatchItem,
  WatchMetadata,
} from "../../packages/shared/src/types/index.ts";

// Re-export schemas for validation in Edge Functions
export {
  CollectionInsertSchema,
  ItemInsertSchema,
  PriceHistoryInsertSchema,
  ProfileUpdateSchema,
} from "../../packages/shared/src/schemas/index.ts";
