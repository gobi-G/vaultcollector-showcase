import type { CardPrice, CardSearchResult, IPriceProvider } from "./interfaces/index.ts";
import { env } from "../config/env.ts";

const BASE_URL = "https://api.pokemontcg.io/v2";

export const pokemonTcgProvider: IPriceProvider = {
  name: "pokemon-tcg",

  async getPrice(cardApiId: string): Promise<CardPrice | null> {
    const res = await fetch(`${BASE_URL}/cards/${cardApiId}`, {
      headers: { "X-Api-Key": env.pokemonTcgApiKey },
    });

    if (!res.ok) return null;

    const { data } = await res.json();
    const tcgPrice =
      data?.tcgplayer?.prices?.holofoil?.market ??
      data?.tcgplayer?.prices?.normal?.market ??
      data?.tcgplayer?.prices?.reverseHolofoil?.market ??
      null;

    if (!tcgPrice) return null;

    return {
      cardApiId: data.id,
      name: data.name,
      price: tcgPrice,
      currency: "USD",
      source: "tcgplayer",
      updatedAt: data.tcgplayer?.updatedAt ?? new Date().toISOString(),
    };
  },

  async searchCards(query: string, limit = 10): Promise<CardSearchResult[]> {
    const res = await fetch(
      `${BASE_URL}/cards?q=name:"${encodeURIComponent(query)}"&pageSize=${limit}&orderBy=-set.releaseDate`,
      { headers: { "X-Api-Key": env.pokemonTcgApiKey } },
    );

    if (!res.ok) return [];

    const { data } = await res.json();

    return (data ?? []).map(
      (card: Record<string, unknown>): CardSearchResult => ({
        cardApiId: card.id as string,
        name: card.name as string,
        setName: (card.set as Record<string, unknown>)?.name as string,
        imageUrl: (card.images as Record<string, unknown>)?.small as string,
        rarity: (card.rarity as string) ?? null,
        price:
          (card.tcgplayer as Record<string, unknown>)?.prices != null
            ? ((card.tcgplayer as Record<string, Record<string, Record<string, number>>>)
                ?.prices?.holofoil?.market ??
              (card.tcgplayer as Record<string, Record<string, Record<string, number>>>)
                ?.prices?.normal?.market ??
              null)
            : null,
      }),
    );
  },

  async lookupByBarcode(_barcode: string): Promise<CardSearchResult | null> {
    // Pokémon TCG API doesn't support barcode lookup directly
    // This would need a barcode-to-set mapping table
    return null;
  },
};
