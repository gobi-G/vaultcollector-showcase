import type { z } from "zod";
import type {
  PriceHistoryInsertSchema,
  PriceHistorySchema,
} from "../schemas/price-history.schema";

export type PriceHistory = z.infer<typeof PriceHistorySchema>;
export type PriceHistoryInsert = z.infer<typeof PriceHistoryInsertSchema>;
