import type { z } from "zod";
import type {
  CollectionInsertSchema,
  CollectionSchema,
  CollectionUpdateSchema,
} from "../schemas/collection.schema";

export type Collection = z.infer<typeof CollectionSchema>;
export type CollectionInsert = z.infer<typeof CollectionInsertSchema>;
export type CollectionUpdate = z.infer<typeof CollectionUpdateSchema>;
