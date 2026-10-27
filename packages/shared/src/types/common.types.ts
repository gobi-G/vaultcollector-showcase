import type { z } from "zod";
import type {
  CategorySchema,
  ItemConditionSchema,
  LanguageSchema,
  PriceSourceSchema,
  SubscriptionTierSchema,
} from "../schemas/common.schema";

export type SubscriptionTier = z.infer<typeof SubscriptionTierSchema>;
export type ItemCondition = z.infer<typeof ItemConditionSchema>;
export type PriceSource = z.infer<typeof PriceSourceSchema>;
export type Language = z.infer<typeof LanguageSchema>;
export type Category = z.infer<typeof CategorySchema>;
