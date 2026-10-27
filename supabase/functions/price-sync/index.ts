import {
  authenticateRequest,
  createServiceClient,
  handleCors,
  jsonResponse,
  errorResponse,
} from "../_shared/index.ts";

const POKEMON_TCG_API = "https://api.pokemontcg.io/v2/cards";
const SCRYFALL_API = "https://api.scryfall.com/cards/collection";
const YGOPRO_API = "https://db.ygoprodeck.com/api/v7/cardinfo.php";

type TcgItem = {
  id: string;
  name: string;
  metadata: Record<string, unknown>;
};

// ── Pokemon Price Fetch ──
async function fetchPokemonPrices(items: TcgItem[]): Promise<Record<string, number>> {
  const priceMap: Record<string, number> = {};
  const cardIds = items.map((i) => i.metadata.card_api_id as string).filter(Boolean);
  if (cardIds.length === 0) return priceMap;

  const idQuery = cardIds.map((id) => `id:${id}`).join(" OR ");
  const apiUrl = `${POKEMON_TCG_API}?q=${encodeURIComponent(idQuery)}&pageSize=${Math.min(cardIds.length, 250)}`;

  try {
    const res = await fetch(apiUrl);
    if (res.ok) {
      const data = await res.json();
      for (const card of data.data ?? []) {
        const prices = card.tcgplayer?.prices;
        if (prices) {
          const priceType = prices.holofoil ?? prices.reverseHolofoil ?? prices.normal ?? prices["1stEditionHolofoil"] ?? Object.values(prices)[0] as Record<string, number> | undefined;
          if (priceType && typeof priceType === "object" && "market" in priceType) {
            priceMap[card.id] = (priceType as Record<string, number>).market;
          }
        }
      }
    }
  } catch { /* continue */ }

  return priceMap;
}

// ── Magic Price Fetch (Scryfall) ──
async function fetchMagicPrices(items: TcgItem[]): Promise<Record<string, number>> {
  const priceMap: Record<string, number> = {};
  const cardIds = items.map((i) => i.metadata.card_api_id as string).filter(Boolean);
  if (cardIds.length === 0) return priceMap;

  // Scryfall collection endpoint accepts up to 75 identifiers
  const identifiers = cardIds.map((id) => ({ id }));
  const batches = [];
  for (let i = 0; i < identifiers.length; i += 75) {
    batches.push(identifiers.slice(i, i + 75));
  }

  for (const batch of batches) {
    try {
      const res = await fetch(SCRYFALL_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifiers: batch }),
      });
      if (res.ok) {
        const data = await res.json();
        for (const card of data.data ?? []) {
          const price = parseFloat(card.prices?.usd ?? "0");
          if (price > 0) {
            priceMap[card.id] = price;
          }
        }
      }
    } catch { /* continue */ }
  }

  return priceMap;
}

// ── Yu-Gi-Oh Price Fetch ──
async function fetchYugiohPrices(items: TcgItem[]): Promise<Record<string, number>> {
  const priceMap: Record<string, number> = {};

  for (const item of items) {
    const cardApiId = item.metadata.card_api_id as string;
    if (!cardApiId) continue;

    try {
      const res = await fetch(`${YGOPRO_API}?id=${encodeURIComponent(cardApiId)}`);
      if (res.ok) {
        const data = await res.json();
        const card = data.data?.[0];
        const price = parseFloat(card?.card_prices?.[0]?.tcgplayer_price ?? "0");
        if (price > 0) {
          priceMap[cardApiId] = price;
        }
      }
    } catch { /* continue */ }
  }

  return priceMap;
}

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const user = await authenticateRequest(req);
    const supabase = createServiceClient();

    // Get all TCG items
    const { data: items, error: itemsError } = await supabase
      .from("items")
      .select("id, name, category, metadata, current_market_price")
      .eq("user_id", user.id)
      .eq("category", "tcg");

    if (itemsError) {
      throw new Error(itemsError.message);
    }

    if (!items || items.length === 0) {
      return jsonResponse({ message: "No TCG items found", updated: 0, failed: 0, total: 0 });
    }

    // Group items by tcg_type
    const pokemonItems: TcgItem[] = [];
    const magicItems: TcgItem[] = [];
    const yugiohItems: TcgItem[] = [];

    for (const item of items) {
      const meta = item.metadata as Record<string, unknown> | null;
      if (!meta || !meta.card_api_id) continue;
      const tcgType = (meta.tcg_type as string) ?? "pokemon";
      switch (tcgType) {
        case "magic": magicItems.push(item as TcgItem); break;
        case "yugioh": yugiohItems.push(item as TcgItem); break;
        default: pokemonItems.push(item as TcgItem); break;
      }
    }

    // Fetch prices in parallel
    const [pokemonPrices, magicPrices, yugiohPrices] = await Promise.all([
      pokemonItems.length > 0 ? fetchPokemonPrices(pokemonItems) : Promise.resolve({}),
      magicItems.length > 0 ? fetchMagicPrices(magicItems) : Promise.resolve({}),
      yugiohItems.length > 0 ? fetchYugiohPrices(yugiohItems) : Promise.resolve({}),
    ]);

    // Merge all price maps
    const allPrices = { ...pokemonPrices, ...magicPrices, ...yugiohPrices };
    const allItems = [...pokemonItems, ...magicItems, ...yugiohItems];

    let updated = 0;
    let failed = 0;

    for (const item of allItems) {
      const cardApiId = item.metadata.card_api_id as string;
      const newPrice = allPrices[cardApiId];

      if (newPrice !== undefined && newPrice > 0) {
        try {
          await supabase
            .from("items")
            .update({ current_market_price: newPrice })
            .eq("id", item.id);

          await supabase
            .from("price_history")
            .insert({
              item_id: item.id,
              price: newPrice,
              source: "tcgplayer",
            });

          updated++;
        } catch {
          failed++;
        }
      } else {
        failed++;
      }
    }

    return jsonResponse({
      message: "Price sync completed",
      updated,
      failed,
      total: allItems.length,
      breakdown: {
        pokemon: pokemonItems.length,
        magic: magicItems.length,
        yugioh: yugiohItems.length,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
});
