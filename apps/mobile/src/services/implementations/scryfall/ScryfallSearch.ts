import type { CardSearchResult } from "@vault-collector/shared";
import type { ICardSearchService } from "../../interfaces/CardSearchInterface";
import { logger } from "@/utils/Logger";

const BASE_URL = "https://api.scryfall.com";

type ScryfallImageUris = {
  normal?: string;
  small?: string;
  large?: string;
};

type ScryfallCardFace = {
  image_uris?: ScryfallImageUris;
};

type ScryfallCard = {
  id: string;
  name: string;
  set: string;
  set_name: string;
  collector_number: string;
  rarity?: string;
  illustration_id?: string;
  image_uris?: ScryfallImageUris;
  card_faces?: ScryfallCardFace[];
  prices?: {
    usd?: string | null;
    usd_foil?: string | null;
    eur?: string | null;
  };
};

function extractImageUrl(card: ScryfallCard): string {
  if (card.image_uris?.normal) return card.image_uris.normal;
  if (card.card_faces?.[0]?.image_uris?.normal) return card.card_faces[0].image_uris.normal;
  if (card.image_uris?.small) return card.image_uris.small;
  if (card.card_faces?.[0]?.image_uris?.small) return card.card_faces[0].image_uris.small;
  return "";
}

function extractPrice(card: ScryfallCard): number | null {
  const usd = card.prices?.usd;
  if (usd) return parseFloat(usd);
  const usdFoil = card.prices?.usd_foil;
  if (usdFoil) return parseFloat(usdFoil);
  const eur = card.prices?.eur;
  if (eur) return parseFloat(eur);
  return null;
}

async function fetchAllPrintings(cardName: string): Promise<CardSearchResult["setVersions"]> {
  try {
    const encoded = encodeURIComponent(`!"${cardName}"`);
    const url = `${BASE_URL}/cards/search?q=${encoded}&unique=prints&order=released`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const json = await response.json();
    const cards: ScryfallCard[] = json.data ?? [];
    if (cards.length <= 1) return null;

    return cards.map((card) => ({
      setCode: card.set,
      setName: card.set_name,
      rarity: card.rarity ?? null,
      price: extractPrice(card),
      imageUrl: extractImageUrl(card),
      artworkId: card.illustration_id ?? card.id,
    }));
  } catch {
    return null;
  }
}

async function fetchUniqueArtworks(cardName: string): Promise<CardSearchResult["artworkImages"]> {
  try {
    const encoded = encodeURIComponent(`!"${cardName}"`);
    const url = `${BASE_URL}/cards/search?q=${encoded}&unique=art&order=released`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const json = await response.json();
    const cards: ScryfallCard[] = json.data ?? [];
    if (cards.length <= 1) return null;

    return cards.map((card) => ({
      id: card.illustration_id ?? card.id,
      imageUrl: extractImageUrl(card),
      imageUrlSmall: card.image_uris?.small ?? card.card_faces?.[0]?.image_uris?.small ?? extractImageUrl(card),
    }));
  } catch {
    return null;
  }
}

export const scryfallSearch: ICardSearchService = {
  async getById(scryfallId: string): Promise<CardSearchResult | null> {
    // scryfallId format: "set/number" e.g. "rna/123" — slash is a path separator, not encoded
    const [set, number] = scryfallId.split("/");
    if (!set || !number) {
      logger.warn("Scryfall", `Invalid scryfallId format: ${scryfallId}`);
      return null;
    }
    const url = `${BASE_URL}/cards/${encodeURIComponent(set)}/${encodeURIComponent(number)}`;
    logger.api("GET", url, { scryfallId });

    const response = await fetch(url);
    if (!response.ok) {
      logger.warn("Scryfall", `Card not found by ID: ${scryfallId}`);
      return null;
    }

    const card: ScryfallCard = await response.json();
    if (!card) return null;

    const [setVersions, artworkImages] = await Promise.all([
      fetchAllPrintings(card.name),
      fetchUniqueArtworks(card.name),
    ]);

    return {
      cardApiId: card.id,
      name: card.name,
      setName: card.set_name,
      setCode: card.set ?? null,
      imageUrl: extractImageUrl(card),
      rarity: card.rarity ?? null,
      price: extractPrice(card),
      cardNumber: card.collector_number ?? null,
      passcode: null,
      setVersions,
      artworkImages,
    };
  },

  async search(query: string, limit = 8): Promise<CardSearchResult[]> {
    // Detect collector number search (e.g. "123/259" or "cn:123")
    const isNumberSearch = /^\d+\/\d+$/.test(query.trim());
    const searchQuery = isNumberSearch ? `cn:${query.split("/")[0]}` : query;
    const encoded = encodeURIComponent(searchQuery);
    const url = `${BASE_URL}/cards/search?q=${encoded}&unique=cards`;

    logger.api("GET", url, { query, limit });

    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404 || response.status === 400) {
        logger.info("Scryfall", "No results found", { query, status: response.status });
        return [];
      }
      logger.error("Scryfall", "API request failed", null, { status: response.status, query });
      throw new Error(`Scryfall API error: ${response.status}`);
    }

    const json = await response.json();
    const cards: ScryfallCard[] = (json.data ?? []).slice(0, limit);
    logger.info("Scryfall", `Found ${cards.length} results`, { query });

    // For each unique card name, fetch all printings
    const results: CardSearchResult[] = [];
    const fetchedNames = new Set<string>();

    for (const card of cards) {
      let versions: CardSearchResult["setVersions"] = null;
      let artworks: CardSearchResult["artworkImages"] = null;
      if (!fetchedNames.has(card.name)) {
        fetchedNames.add(card.name);
        [versions, artworks] = await Promise.all([
          fetchAllPrintings(card.name),
          fetchUniqueArtworks(card.name),
        ]);
      }

      results.push({
        cardApiId: card.id,
        name: card.name,
        setName: card.set_name,
        setCode: card.set ?? null,
        imageUrl: extractImageUrl(card),
        rarity: card.rarity ?? null,
        price: extractPrice(card),
        cardNumber: card.collector_number ?? null,
        passcode: null,
        setVersions: versions,
        artworkImages: artworks,
      });
    }

    return results;
  },
};
