import { z } from "zod";
import { CategorySchema } from "./common.schema";

export const CollectionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().nullable(),
  category: CategorySchema,
  cover_image_url: z.string().url().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CollectionInsertSchema = CollectionSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const CollectionUpdateSchema = CollectionSchema.partial()
  .omit({ user_id: true, created_at: true, updated_at: true })
  .required({ id: true });
