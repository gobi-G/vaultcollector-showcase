import { z } from "zod";
import { PriceSourceSchema } from "./common.schema";

export const PriceHistorySchema = z.object({
  id: z.string().uuid(),
  item_id: z.string().uuid(),
  price: z.number().nonnegative(),
  source: PriceSourceSchema,
  recorded_at: z.string().datetime(),
});

export const PriceHistoryInsertSchema = PriceHistorySchema.omit({
  id: true,
  recorded_at: true,
});
