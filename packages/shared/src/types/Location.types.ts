import type { z } from "zod";
import type {
  LocationIconSchema,
  LocationInsertSchema,
  LocationSchema,
  LocationUpdateSchema,
} from "../schemas/Location.schema";

export type Location = z.infer<typeof LocationSchema>;
export type LocationInsert = z.infer<typeof LocationInsertSchema>;
export type LocationUpdate = z.infer<typeof LocationUpdateSchema>;
export type LocationIcon = z.infer<typeof LocationIconSchema>;
