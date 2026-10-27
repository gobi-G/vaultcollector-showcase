import { z } from "zod";

export const WatchMetadataSchema = z.object({
  brand: z.string(),
  model: z.string(),
  reference_number: z.string().nullable().optional(),
  movement: z.enum(["automatic", "manual", "quartz"]).nullable().optional(),
  case_material: z.string().nullable().optional(),
  case_diameter_mm: z.number().positive().nullable().optional(),
  year_produced: z.number().int().nullable().optional(),
  box_papers: z.boolean().nullable().optional(),
});
