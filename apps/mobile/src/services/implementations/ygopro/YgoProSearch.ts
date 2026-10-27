import type { CardSearchResult } from "@vault-collector/shared";
import type { ICardSearchService } from "../../interfaces/CardSearchInterface";
import { logger } from "@/utils/Logger";

const BASE_URL = "https://db.ygoprodeck.com/api/v7";

type YgoCardImage = {
  id: number;
  image_url: string;
  image_url_small: string;
  image_url_cropped: string;
};

type YgoCardPrice = {
  tcgplayer_price: string;
  cardmarket_price: string;
  ebay_price: string;
  amazon_price: string;
};

type YgoCard = {
  id: number;
  name: string;
  type: string;
  race: string;
  archetype?: string;
  card_images: YgoCardImage[];
  card_prices: YgoCardPrice[];
  card_sets?: {
    set_name: string;
    set_code: string;
    set_rarity: string;
    set_price: string;
  }[];
};

function extractPrice(card: YgoCard): number | null {
  const tcgPrice = card.card_prices?.[0]?.tcgplayer_price;
  if (tcgPrice && tcgPrice !== "0.00") return parseFloat(tcgPrice);
  const cardmarketPrice = card.card_prices?.[0]?.cardmarket_price;
  if (cardmarketPrice && cardmarketPrice !== "0.00") return parseFloat(cardmarketPrice);
  return null;
}

export const ygoProSearch: ICardSearchService = {
  async getById(passcode: string): Promise<CardSearchResult | null> {
    const url = `${BASE_URL}/cardinfo.php?id=${encodeURIComponent(passcode)}`;
    logger.api("GET", url, { passcode });

    const response = await fetch(url);
    if (!response.ok) {
      logger.warn("YGOPro", `Card not found by passcode: ${passcode}`);
      return null;
    }

    const json = await response.json();
    const card: YgoCard = json.data?.[0];
    if (!card) return null;

    // Passcode lookup returns only 1 image — fetch by exact name to get all artworks
    let allImages = card.card_images;
    if (card.card_images.length <= 1) {
      try {
        const nameUrl = `${BASE_URL}/cardinfo.php?name=${encodeURIComponent(card.name)}`;
        const nameResponse = await fetch(nameUrl);
        if (nameResponse.ok) {
          const nameJson = await nameResponse.json();
          const fullCard: YgoCard | undefined = nameJson.data?.[0];
          if (fullCard && fullCard.card_images.length > 1) {
            allImages = fullCard.card_images;
          }
        }
      } catch {
        // Fallback to single image silently
      }
    }

    const artworkImages = allImages.length > 1
      ? allImages.map((img) => ({
          id: String(img.id), imageUrl: img.image_url, imageUrlSmall: img.image_url_small,
        }))
      : null;

    return {
      cardApiId: String(card.id),
      name: card.name,
      setName: card.card_sets?.[0]?.set_name ?? card.type,
      setCode: card.card_sets?.[0]?.set_code ?? null,
      imageUrl: allImages[0]?.image_url_small ?? allImages[0]?.image_url ?? "",
      rarity: card.card_sets?.[0]?.set_rarity ?? null,
      price: extractPrice(card),
      cardNumber: card.card_sets?.[0]?.set_code ?? null,
      passcode: String(card.id),
      setVersions: null,
      artworkImages,
    };
  },

  async search(query: string, limit = 8): Promise<CardSearchResult[]> {
    // Detect passcode search (all digits, 5-10 chars) → show all set versions
    const isPasscode = /^\d{5,10}$/.test(query.trim());
    if (isPasscode) {
      const url = `${BASE_URL}/cardinfo.php?id=${encodeURIComponent(query.trim())}`;
      logger.api("GET", url, { passcode: query.trim() });
      const response = await fetch(url);
      if (!response.ok) return [];
      const json = await response.json();
      const card: YgoCard = json.data?.[0];
      if (!card) return [];

      // Passcode search returns only 1 image — fetch by exact name to get all artworks
      let allImages = card.card_images;
      if (card.card_images.length <= 1) {
        try {
          const nameUrl = `${BASE_URL}/cardinfo.php?name=${encodeURIComponent(card.name)}`;
          const nameResponse = await fetch(nameUrl);
          if (nameResponse.ok) {
            const nameJson = await nameResponse.json();
            const fullCard: YgoCard | undefined = nameJson.data?.[0];
            if (fullCard && fullCard.card_images.length > 1) {
              allImages = fullCard.card_images;
            }
          }
        } catch {
          // Fallback to single image silently
        }
      }

      const imageUrl = allImages[0]?.image_url_small ?? allImages[0]?.image_url ?? "";
      const sets = card.card_sets ?? [];
      const artworkImages = allImages.length > 1
        ? allImages.map((img) => ({
            id: String(img.id), imageUrl: img.image_url, imageUrlSmall: img.image_url_small,
          }))
        : null;

      if (sets.length === 0) {
        return [{
          cardApiId: String(card.id),
          name: card.name,
          setName: card.type,
          setCode: null,
          imageUrl,
          rarity: null,
          price: extractPrice(card),
          cardNumber: null,
          passcode: String(card.id),
          setVersions: null,
          artworkImages,
        }];
      }

      return sets.slice(0, limit).map((s) => ({
        cardApiId: String(card.id),
        name: card.name,
        setName: s.set_name,
        setCode: s.set_code,
        imageUrl,
        rarity: s.set_rarity,
        price: s.set_price && s.set_price !== "0" ? parseFloat(s.set_price) : extractPrice(card),
        cardNumber: s.set_code,
        passcode: String(card.id),
        setVersions: null,
        artworkImages,
      }));
    }

    const encoded = encodeURIComponent(query);
    const url = `${BASE_URL}/cardinfo.php?fname=${encoded}&num=${limit}&offset=0`;

    logger.api("GET", url, { query, limit });

    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 400) {
        logger.info("YGOPro", "No results found", { query });
        return [];
      }
      logger.error("YGOPro", "API request failed", null, { status: response.status, query });
      throw new Error(`YGOPRODeck API error: ${response.status}`);
    }

    const json = await response.json();
    const cards: YgoCard[] = (json.data ?? []).slice(0, limit);
    logger.info("YGOPro", `Found ${cards.length} results`, { query });

    return cards.map((card) => {
      const sets = card.card_sets ?? [];
      const artworkImages = card.card_images.length > 1
        ? card.card_images.map((img) => ({
            id: String(img.id), imageUrl: img.image_url, imageUrlSmall: img.image_url_small,
          }))
        : null;
      const defaultArtworkId = card.card_images.length > 0 ? String(card.card_images[0].id) : null;
      return {
        cardApiId: String(card.id),
        name: card.name,
        setName: sets[0]?.set_name ?? card.type,
        setCode: sets[0]?.set_code ?? null,
        imageUrl: card.card_images?.[0]?.image_url_small ?? card.card_images?.[0]?.image_url ?? "",
        rarity: sets[0]?.set_rarity ?? null,
        price: extractPrice(card),
        cardNumber: sets[0]?.set_code ?? null,
        passcode: String(card.id),
        setVersions: sets.length > 1 ? sets.map((s) => ({
          setName: s.set_name,
          setCode: s.set_code,
          rarity: s.set_rarity,
          price: s.set_price && s.set_price !== "0" ? parseFloat(s.set_price) : null,
          imageUrl: card.card_images?.[0]?.image_url_small ?? null,
          artworkId: defaultArtworkId,
        })) : null,
        artworkImages,
      };
    });
  },
};
