import { z } from "zod";
import { ItemConditionSchema } from "./common.schema";
import { TcgMetadataSchema } from "./categories/tcg.schema";
import { LegoMetadataSchema } from "./categories/lego.schema";
import { WatchMetadataSchema } from "./categories/watch.schema";

export const BaseItemSchema = z.object({
  id: z.string().uuid(),
  collection_id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  condition: ItemConditionSchema,
  location_id: z.string().uuid().nullable(),
  purchase_price: z.number().nonnegative().nullable(),
  current_market_price: z.number().nonnegative().nullable(),
  image_url: z.string().url().nullable(),
  notes: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const TcgItemSchema = BaseItemSchema.extend({
  category: z.literal("tcg"),
  metadata: TcgMetadataSchema,
});

export const LegoItemSchema = BaseItemSchema.extend({
  category: z.literal("lego"),
  metadata: LegoMetadataSchema,
});

export const WatchItemSchema = BaseItemSchema.extend({
  category: z.literal("watch"),
  metadata: WatchMetadataSchema,
});

export const ItemSchema = z.discriminatedUnion("category", [
  TcgItemSchema,
  LegoItemSchema,
  WatchItemSchema,
]);

export const ItemInsertSchema = z.discriminatedUnion("category", [
  TcgItemSchema.omit({ id: true, created_at: true, updated_at: true }),
  LegoItemSchema.omit({ id: true, created_at: true, updated_at: true }),
  WatchItemSchema.omit({ id: true, created_at: true, updated_at: true }),
]);

export const ItemUpdateSchema = BaseItemSchema.partial()
  .omit({ user_id: true, created_at: true, updated_at: true })
  .extend({
    id: z.string().uuid(),
    metadata: z
      .union([TcgMetadataSchema.partial(), LegoMetadataSchema.partial(), WatchMetadataSchema.partial()])
      .optional(),
  });
