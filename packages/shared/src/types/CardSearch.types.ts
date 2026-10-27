import type { z } from "zod";
import type { ArtworkImageSchema, CardSearchResultSchema, SetVersionSchema } from "../schemas/CardSearch.schema";

export type ArtworkImage = z.infer<typeof ArtworkImageSchema>;
export type SetVersion = z.infer<typeof SetVersionSchema>;
export type CardSearchResult = z.infer<typeof CardSearchResultSchema>;
