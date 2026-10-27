import type { z } from "zod";
import type {
  BaseItemSchema,
  ItemInsertSchema,
  ItemSchema,
  ItemUpdateSchema,
  LegoItemSchema,
  TcgItemSchema,
  WatchItemSchema,
} from "../schemas/item.schema";
import type { TcgMetadataSchema, TcgTypeSchema } from "../schemas/categories/tcg.schema";
import type { LegoMetadataSchema } from "../schemas/categories/lego.schema";
import type { WatchMetadataSchema } from "../schemas/categories/watch.schema";

export type BaseItem = z.infer<typeof BaseItemSchema>;
export type TcgItem = z.infer<typeof TcgItemSchema>;
export type LegoItem = z.infer<typeof LegoItemSchema>;
export type WatchItem = z.infer<typeof WatchItemSchema>;
export type Item = z.infer<typeof ItemSchema>;
export type ItemInsert = z.infer<typeof ItemInsertSchema>;
export type ItemUpdate = z.infer<typeof ItemUpdateSchema>;

export type TcgMetadata = z.infer<typeof TcgMetadataSchema>;
export type TcgType = z.infer<typeof TcgTypeSchema>;
export type LegoMetadata = z.infer<typeof LegoMetadataSchema>;
export type WatchMetadata = z.infer<typeof WatchMetadataSchema>;
