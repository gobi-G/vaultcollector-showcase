import { z } from "zod";
import { LanguageSchema, SubscriptionTierSchema } from "./common.schema";

export const ProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  display_name: z.string().nullable(),
  avatar_url: z.string().url().nullable(),
  subscription_tier: SubscriptionTierSchema,
  language: LanguageSchema,
  ai_consent_given: z.boolean().nullable(),
  ai_consent_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const ProfileUpdateSchema = ProfileSchema.partial().omit({
  id: true,
  email: true,
  created_at: true,
  updated_at: true,
});
