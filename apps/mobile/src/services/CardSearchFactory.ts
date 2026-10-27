import type { CardSearchResult, TcgType } from "@vault-collector/shared";
import type { ICardSearchService } from "./interfaces/CardSearchInterface";
import {
  supabasePokemonSearch,
  supabaseYugiohSearch,
} from "./implementations/supabase";
import { pokemonTcgSearch } from "./implementations/supabase/PokemonTcgSearch";
import { scryfallSearch } from "./implementations/scryfall/ScryfallSearch";
import { ygoProSearch } from "./implementations/ygopro/YgoProSearch";
import { logger } from "@/utils/Logger";

/** Primary providers — proxied through the card-search Edge Function (except Magic → direct Scryfall) */
const primaryProviders: Record<TcgType, ICardSearchService> = {
  pokemon: supabasePokemonSearch,
  magic: scryfallSearch,
  yugioh: supabaseYugiohSearch,
};

/** Fallback providers — direct API calls if Edge Function fails */
const fallbackProviders: Record<TcgType, ICardSearchService> = {
  pokemon: pokemonTcgSearch,
  magic: scryfallSearch,
  yugioh: ygoProSearch,
};

/**
 * Creates a search service that tries the Supabase Edge Function first,
 * falling back to direct API calls if the Edge Function is unavailable.
 */
function createSearchWithFallback(tcgType: TcgType): ICardSearchService {
  return {
    async search(query: string, limit?: number): Promise<CardSearchResult[]> {
      let results: CardSearchResult[];
      try {
        results = await primaryProviders[tcgType].search(query, limit);
      } catch (error) {
        logger.warn(
          "CardSearchFactory",
          `Edge Function failed for ${tcgType}, falling back to direct API`,
          { error: String(error) },
        );
        results = await fallbackProviders[tcgType].search(query, limit);
      }

      return results;
    },
  };
}

const providers: Record<TcgType, ICardSearchService> = {
  pokemon: createSearchWithFallback("pokemon"),
  magic: createSearchWithFallback("magic"),
  yugioh: createSearchWithFallback("yugioh"),
};

export function getSearchProvider(tcgType: TcgType): ICardSearchService {
  return providers[tcgType];
}
