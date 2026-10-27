import { z } from "zod";

export const TcgTypeSchema = z.enum(["pokemon", "magic", "yugioh"]);

export const TcgGradingCompanySchema = z.enum(["raw", "psa", "bgs", "cgc"]);

export const TcgMetadataSchema = z.object({
  card_api_id: z.string(),
  set_name: z.string(),
  card_number: z.string().nullable().optional(),
  rarity: z.string().nullable().optional(),
  artist: z.string().nullable().optional(),
  tcg_type: TcgTypeSchema.nullable().optional(),
  grading_company: TcgGradingCompanySchema.nullable().optional(),
  grading_score: z.number().min(1).max(10).nullable().optional(),
});
