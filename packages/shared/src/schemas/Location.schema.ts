import { z } from "zod";

export const LocationIconSchema = z.enum([
  "box",
  "binder",
  "shelf",
  "safe",
  "display",
  "watch-box",
  "room",
  "page",
]);

export const LocationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  parent_id: z.string().uuid().nullable(),
  icon: LocationIconSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const LocationInsertSchema = LocationSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const LocationUpdateSchema = LocationSchema.partial()
  .omit({ user_id: true, created_at: true, updated_at: true })
  .required({ id: true });
