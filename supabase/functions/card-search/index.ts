import { createClient } from "npm:@supabase/supabase-js@2";
import {
  authenticateRequest,
  errorResponse,
  handleCors,
  jsonResponse,
  ValidationError,
} from "../_shared/index.ts";
import { env } from "../../config/env.ts";
import {
  extractPokemonPrice,
  extractScryfallImageUrl,
  extractScryfallPrice,
  extractYgoPrice,
  type PokemonTcgCard,
  type ScryfallCard,
  type YgoCard,
} from "./mappers.ts";

// ── Types ──

type TcgType = "pokemon" | "magic" | "yugioh";

type ArtworkImage = {
  id: string;
  imageUrl: string;
  imageUrlSmall: string;
};

type SetVersion = {
  setName: string;
  setCode: string;
  rarity: string | null;
  price: number | null;
  imageUrl: string | null;
  artworkId: string | null;
};

type CardSearchResult = {
  cardApiId: string;
  name: string;
  setName: string;
  setCode: string | null;
  imageUrl: string;
  rarity: string | null;
  price: number | null;
  cardNumber: string | null;
  passcode: string | null;
  setVersions: SetVersion[] | null;
  artworkImages: ArtworkImage[] | null;
};

type CardSearchRequest = {
  query?: string;
  tcgType?: string;
  limit?: number;
};

// ── Pokemon TCG API ──

async function searchPokemon(query: string, limit: number): Promise<CardSearchResult[]> {
  const isCardId = /^[a-z]+\d*-\d+$/i.test(query);
  const searchQuery = isCardId ? `id:${query}` : `name:"${query}"`;
  const encoded = encodeURIComponent(searchQuery);
  const url = `https://api.pokemontcg.io/v2/cards?q=${encoded}&pageSize=${limit}`;

  const headers: Record<string, string> = {};
  const apiKey = env.pokemonTcgApiKey;
  if (apiKey) {
    headers["X-Api-Key"] = apiKey;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`Pokemon TCG API error: ${response.status}`);
  }

  const json = await response.json();
  const cards: PokemonTcgCard[] = json.data ?? [];

  return cards.map((card) => ({
    cardApiId: card.id,
    name: card.name,
    setName: card.set.name,
    setCode: card.set.id ?? null,
    imageUrl: card.images.small,
    rarity: card.rarity ?? null,
    price: extractPokemonPrice(card),
    cardNumber: card.number ?? null,
    passcode: null,
    setVersions: null,
    artworkImages: null,
  }));
}

// ── Scryfall (Magic) API ──

async function searchMagic(query: string, limit: number): Promise<CardSearchResult[]> {
  const isNumberSearch = /^\d+\/\d+$/.test(query);
  const searchQuery = isNumberSearch ? `cn:${query.split("/")[0]}` : query;
  const encoded = encodeURIComponent(searchQuery);
  const url = `https://api.scryfall.com/cards/search?q=${encoded}&unique=cards`;

  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 404) {
      return [];
    }
    throw new Error(`Scryfall API error: ${response.status}`);
  }

  const json = await response.json();
  const cards: ScryfallCard[] = (json.data ?? []).slice(0, limit);

  return cards.map((card) => ({
    cardApiId: card.id,
    name: card.name,
    setName: card.set_name,
    setCode: card.set ?? null,
    imageUrl: extractScryfallImageUrl(card),
    rarity: card.rarity ?? null,
    price: extractScryfallPrice(card),
    cardNumber: card.collector_number ?? null,
    passcode: null,
    setVersions: null,
    artworkImages: null,
  }));
}

// ── YGOPRODeck (Yu-Gi-Oh) API ──

async function searchYugioh(query: string, limit: number): Promise<CardSearchResult[]> {
  // Detect passcode search (all digits, 5-10 chars) → expand all set versions
  const isPasscode = /^\d{5,10}$/.test(query);

  if (isPasscode) {
    const url = `https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    if (!response.ok) return [];
    const json = await response.json();
    const card: YgoCard = json.data?.[0];
    if (!card) return [];

    // Passcode search returns only 1 image — fetch by exact name to get all artworks
    let allImages = card.card_images;
    if (card.card_images.length <= 1) {
      try {
        const nameUrl = `https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodeURIComponent(card.name)}`;
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
    const artworkImages: ArtworkImage[] | null = allImages.length > 1
      ? allImages.map((img) => ({
          id: String(img.id),
          imageUrl: img.image_url,
          imageUrlSmall: img.image_url_small,
        }))
      : null;
    const defaultArtworkId = allImages.length > 0 ? String(allImages[0].id) : null;

    if (sets.length === 0) {
      return [{
        cardApiId: String(card.id), name: card.name, setName: card.type,
        setCode: null, imageUrl, rarity: null, price: extractYgoPrice(card),
        cardNumber: null, passcode: String(card.id), setVersions: null,
        artworkImages,
      }];
    }

    return sets.slice(0, limit).map((s) => ({
      cardApiId: String(card.id), name: card.name, setName: s.set_name,
      setCode: s.set_code, imageUrl, rarity: s.set_rarity,
      price: s.set_price && s.set_price !== "0" ? parseFloat(s.set_price) : extractYgoPrice(card),
      cardNumber: s.set_code, passcode: String(card.id), setVersions: null,
      artworkImages,
    }));
  }

  const url = `https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(query)}&num=${limit}&offset=0`;
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 400) return [];
    throw new Error(`YGOPRODeck API error: ${response.status}`);
  }

  const json = await response.json();
  const cards: YgoCard[] = (json.data ?? []).slice(0, limit);

  return cards.map((card) => {
    const sets = card.card_sets ?? [];
    const artworkImages: ArtworkImage[] | null = card.card_images.length > 1
      ? card.card_images.map((img) => ({
          id: String(img.id),
          imageUrl: img.image_url,
          imageUrlSmall: img.image_url_small,
        }))
      : null;
    const defaultArtworkId = card.card_images.length > 0 ? String(card.card_images[0].id) : null;
    return {
      cardApiId: String(card.id), name: card.name,
      setName: sets[0]?.set_name ?? card.type,
      setCode: sets[0]?.set_code ?? null,
      imageUrl: card.card_images?.[0]?.image_url_small ?? card.card_images?.[0]?.image_url ?? "",
      rarity: sets[0]?.set_rarity ?? null,
      price: extractYgoPrice(card),
      cardNumber: sets[0]?.set_code ?? null,
      passcode: String(card.id),
      setVersions: sets.length > 1 ? sets.map((s) => ({
        setName: s.set_name, setCode: s.set_code,
        rarity: s.set_rarity,
        price: s.set_price && s.set_price !== "0" ? parseFloat(s.set_price) : null,
        imageUrl: card.card_images?.[0]?.image_url_small ?? null,
        artworkId: defaultArtworkId,
      })) : null,
      artworkImages,
    };
  });
}

// ── Search dispatch ──

const VALID_TCG_TYPES: TcgType[] = ["pokemon", "magic", "yugioh"];

const searchProviders: Record<TcgType, (query: string, limit: number) => Promise<CardSearchResult[]>> = {
  pokemon: searchPokemon,
  magic: searchMagic,
  yugioh: searchYugioh,
};

// ── Cache helpers ──

const CACHE_TTL_HOURS = 24;

async function getCachedResults(
  supabase: ReturnType<typeof createClient>,
  query: string,
  tcgType: TcgType,
): Promise<CardSearchResult[] | null> {
  const cutoff = new Date(Date.now() - CACHE_TTL_HOURS * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("search_cache")
    .select("results")
    .eq("query", query.toLowerCase())
    .eq("tcg_type", tcgType)
    .gte("created_at", cutoff)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return (data as { results: CardSearchResult[] }).results;
}

async function setCachedResults(
  supabase: ReturnType<typeof createClient>,
  query: string,
  tcgType: TcgType,
  results: CardSearchResult[],
): Promise<void> {
  await supabase
    .from("search_cache")
    .upsert(
      {
        query: query.toLowerCase(),
        tcg_type: tcgType,
        results,
        created_at: new Date().toISOString(),
      },
      { onConflict: "query,tcg_type" },
    );
}

// ── Edge Function handler ──

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const user = await authenticateRequest(req);

    const body: CardSearchRequest = await req.json();
    const { query, tcgType, limit: rawLimit } = body;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      throw new ValidationError("Missing or empty 'query' field");
    }

    if (!tcgType || !VALID_TCG_TYPES.includes(tcgType as TcgType)) {
      throw new ValidationError(
        `Invalid 'tcgType'. Must be one of: ${VALID_TCG_TYPES.join(", ")}`,
      );
    }

    const limit = Math.min(Math.max(rawLimit ?? 20, 1), 50);
    const validTcgType = tcgType as TcgType;
    const trimmedQuery = query.trim();

    // Create a service-role Supabase client for cache access
    const supabase = createClient(env.supabaseUrl, env.supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // Check cache first
    const cached = await getCachedResults(supabase, trimmedQuery, validTcgType);
    if (cached) {
      return jsonResponse({
        results: cached.slice(0, limit),
        cached: true,
        userId: user.id,
      });
    }

    // Fetch from external API
    const searchFn = searchProviders[validTcgType];
    const results = await searchFn(trimmedQuery, limit);

    // Cache results in background (don't block response)
    setCachedResults(supabase, trimmedQuery, validTcgType, results).catch(() => {
      // Silently ignore cache write failures
    });

    return jsonResponse({
      results,
      cached: false,
      userId: user.id,
    });
  } catch (error) {
    return errorResponse(error);
  }
});
