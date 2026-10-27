import type { CardSearchResult } from "@vault-collector/shared";
import type { ICardSearchService } from "../../interfaces/CardSearchInterface";
import { logger } from "@/utils/Logger";

const BASE_URL = "https://api.pokemontcg.io/v2";

type PokemonTcgCard = {
  id: string;
  name: string;
  number: string;
  set: { id: string; name: string };
  images: { small: string; large: string };
  rarity?: string;
  tcgplayer?: {
    prices?: {
      holofoil?: { market?: number };
      reverseHolofoil?: { market?: number };
      normal?: { market?: number };
    };
  };
  cardmarket?: {
    prices?: { averageSellPrice?: number };
  };
};

function extractPrice(card: PokemonTcgCard): number | null {
  const tcg = card.tcgplayer?.prices;
  if (tcg?.holofoil?.market) return tcg.holofoil.market;
  if (tcg?.reverseHolofoil?.market) return tcg.reverseHolofoil.market;
  if (tcg?.normal?.market) return tcg.normal.market;
  return card.cardmarket?.prices?.averageSellPrice ?? null;
}

export const pokemonTcgSearch: ICardSearchService = {
  async getById(id: string): Promise<CardSearchResult | null> {
    const url = `${BASE_URL}/cards/${encodeURIComponent(id)}`;
    logger.api("GET", url, { id });

    const headers: Record<string, string> = {};
    const apiKey = process.env.EXPO_PUBLIC_POKEMON_TCG_API_KEY;
    if (apiKey) headers["X-Api-Key"] = apiKey;

    const response = await fetch(url, { headers });
    if (!response.ok) {
      logger.warn("PokemonTCG", `Card not found by ID: ${id}`);
      return null;
    }

    const json = await response.json();
    const card: PokemonTcgCard = json.data;
    if (!card) return null;

    return {
      cardApiId: card.id,
      name: card.name,
      setName: card.set.name,
      setCode: card.set.id ?? null,
      imageUrl: card.images.small,
      rarity: card.rarity ?? null,
      price: extractPrice(card),
      cardNumber: card.number ?? null,
      passcode: null,
      setVersions: null,
      artworkImages: null,
    };
  },

  async searchByNameAndNumber(name: string, number: string): Promise<CardSearchResult | null> {
    // Extract clean number: "205/165" → "205"
    const cleanNum = number.split("/")[0].replace(/^0+/, "");
    const encoded = encodeURIComponent(`name:"${name}" number:${cleanNum}`);
    const url = `${BASE_URL}/cards?q=${encoded}&pageSize=1`;

    logger.api("GET", url, { name, number: cleanNum });

    const headers: Record<string, string> = {};
    const apiKey = process.env.EXPO_PUBLIC_POKEMON_TCG_API_KEY;
    if (apiKey) headers["X-Api-Key"] = apiKey;

    const response = await fetch(url, { headers });
    if (!response.ok) return null;

    const json = await response.json();
    const card: PokemonTcgCard = json.data?.[0];
    if (!card) return null;

    return {
      cardApiId: card.id,
      name: card.name,
      setName: card.set.name,
      setCode: card.set.id ?? null,
      imageUrl: card.images.small,
      rarity: card.rarity ?? null,
      price: extractPrice(card),
      cardNumber: card.number ?? null,
      passcode: null,
      setVersions: null,
      artworkImages: null,
    };
  },

  async search(query: string, limit = 8): Promise<CardSearchResult[]> {
    // Detect Card ID search (e.g. "swsh3-20", "base1-4")
    const trimmed = query.trim();
    const isCardId = /^[a-z]+\d*-\d+$/i.test(trimmed);
    const searchQuery = isCardId ? `id:${trimmed}` : `name:"${trimmed}"`;
    const encoded = encodeURIComponent(searchQuery);
    const url = `${BASE_URL}/cards?q=${encoded}&pageSize=${limit}`;

    logger.api("GET", url, { query, limit });

    const headers: Record<string, string> = {};
    const apiKey = process.env.EXPO_PUBLIC_POKEMON_TCG_API_KEY;
    if (apiKey) {
      headers["X-Api-Key"] = apiKey;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
      if (response.status === 400 || response.status === 404) {
        logger.info("PokemonTCG", "No results found", { query, status: response.status });
        return [];
      }
      logger.error("PokemonTCG", "API request failed", null, { status: response.status, query });
      throw new Error(`Pokemon TCG API error: ${response.status}`);
    }

    const json = await response.json();
    const cards: PokemonTcgCard[] = json.data ?? [];
    logger.info("PokemonTCG", `Found ${cards.length} results`, { query });

    return cards.map((card) => ({
      cardApiId: card.id,
      name: card.name,
      setName: card.set.name,
      setCode: card.set.id ?? null,
      imageUrl: card.images.small,
      rarity: card.rarity ?? null,
      price: extractPrice(card),
      cardNumber: card.number ?? null,
      passcode: null,
      setVersions: null,
      artworkImages: null,
    }));
  },
};
