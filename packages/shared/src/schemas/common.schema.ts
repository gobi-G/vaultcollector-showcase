import { z } from "zod";

export const SubscriptionTierSchema = z.enum(["free", "premium", "pro"]);

export const ItemConditionSchema = z.enum(["mint", "near_mint", "played", "damaged"]);

export const CategorySchema = z.enum(["tcg", "lego", "watch"]);

export const PriceSourceSchema = z.enum(["tcgplayer", "cardmarket", "ebay"]);

export const LanguageSchema = z.enum(["en", "de", "fr", "es"]);
