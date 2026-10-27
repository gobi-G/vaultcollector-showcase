import type { CardSearchResult, TcgType } from "@vault-collector/shared";
import type { ICardSearchService } from "../../interfaces/CardSearchInterface";
import { supabase } from "./SupabaseClient";
import { logger } from "@/utils/Logger";

type CardSearchResponse = {
  results: CardSearchResult[];
  cached: boolean;
  userId: string;
};

function createSupabaseCardSearch(tcgType: TcgType): ICardSearchService {
  return {
    async search(query: string, limit = 20): Promise<CardSearchResult[]> {
      logger.info("SupabaseCardSearch", `Searching ${tcgType}: "${query}"`, {
        limit,
      });

      const { data, error } = await supabase.functions.invoke<CardSearchResponse>(
        "card-search",
        {
          body: { query, tcgType, limit },
        },
      );

      if (error) {
        logger.error("SupabaseCardSearch", "Edge Function error", error, {
          query,
          tcgType,
        });
        throw new Error(`Card search failed: ${error.message}`);
      }

      const results = data?.results ?? [];

      logger.debug(
        "SupabaseCardSearch",
        `Found ${results.length} results (cached: ${data?.cached ?? false})`,
        { query, tcgType },
      );

      return results;
    },
  };
}

export const supabasePokemonSearch = createSupabaseCardSearch("pokemon");
export const supabaseMagicSearch = createSupabaseCardSearch("magic");
export const supabaseYugiohSearch = createSupabaseCardSearch("yugioh");
