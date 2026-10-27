import { z } from "zod";

export const LegoMetadataSchema = z.object({
  set_number: z.string(),
  theme: z.string(),
  pieces: z.number().int().nonnegative(),
  sealed: z.boolean(),
  minifigures: z.number().int().nonnegative().nullable().optional(),
  year_released: z.number().int().nullable().optional(),
});
