/**
 * Response types of the external card APIs and pure mapping helpers.
 * Kept free of I/O so price and image selection can be unit tested.
 */

export type PokemonTcgCard = {
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

export function extractPokemonPrice(card: PokemonTcgCard): number | null {
  const tcg = card.tcgplayer?.prices;
  if (tcg?.holofoil?.market) return tcg.holofoil.market;
  if (tcg?.reverseHolofoil?.market) return tcg.reverseHolofoil.market;
  if (tcg?.normal?.market) return tcg.normal.market;
  return card.cardmarket?.prices?.averageSellPrice ?? null;
}

export type ScryfallImageUris = {
  normal?: string;
  small?: string;
  large?: string;
};

export type ScryfallCardFace = {
  image_uris?: ScryfallImageUris;
};

export type ScryfallCard = {
  id: string;
  name: string;
  set: string;
  set_name: string;
  collector_number: string;
  rarity?: string;
  image_uris?: ScryfallImageUris;
  card_faces?: ScryfallCardFace[];
  prices?: {
    usd?: string | null;
    usd_foil?: string | null;
    eur?: string | null;
  };
};

export function extractScryfallImageUrl(card: ScryfallCard): string {
  if (card.image_uris?.normal) return card.image_uris.normal;
  if (card.card_faces?.[0]?.image_uris?.normal)
    return card.card_faces[0].image_uris.normal;
  if (card.image_uris?.small) return card.image_uris.small;
  if (card.card_faces?.[0]?.image_uris?.small) return card.card_faces[0].image_uris.small;
  return "";
}

export function extractScryfallPrice(card: ScryfallCard): number | null {
  const usd = card.prices?.usd;
  if (usd) return parseFloat(usd);
  const usdFoil = card.prices?.usd_foil;
  if (usdFoil) return parseFloat(usdFoil);
  const eur = card.prices?.eur;
  if (eur) return parseFloat(eur);
  return null;
}

export type YgoCardImage = {
  id: number;
  image_url: string;
  image_url_small: string;
  image_url_cropped: string;
};

export type YgoCardPrice = {
  tcgplayer_price: string;
  cardmarket_price: string;
  ebay_price: string;
  amazon_price: string;
};

export type YgoCard = {
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

export function extractYgoPrice(card: YgoCard): number | null {
  const tcgPrice = card.card_prices?.[0]?.tcgplayer_price;
  if (tcgPrice && tcgPrice !== "0.00") return parseFloat(tcgPrice);
  const cardmarketPrice = card.card_prices?.[0]?.cardmarket_price;
  if (cardmarketPrice && cardmarketPrice !== "0.00") return parseFloat(cardmarketPrice);
  return null;
}
