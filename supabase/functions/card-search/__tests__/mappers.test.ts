import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  extractPokemonPrice,
  extractScryfallImageUrl,
  extractScryfallPrice,
  extractYgoPrice,
  type PokemonTcgCard,
  type ScryfallCard,
  type YgoCard,
} from "../mappers.ts";

const pokemonCard = (overrides: Partial<PokemonTcgCard> = {}): PokemonTcgCard => ({
  id: "swsh3-20",
  name: "Charizard VMAX",
  number: "20",
  set: { id: "swsh3", name: "Darkness Ablaze" },
  images: { small: "small.png", large: "large.png" },
  ...overrides,
});

Deno.test("extractPokemonPrice", async (t) => {
  await t.step("prefers the holofoil market price", () => {
    const card = pokemonCard({
      tcgplayer: { prices: { holofoil: { market: 250 }, normal: { market: 10 } } },
    });
    assertEquals(extractPokemonPrice(card), 250);
  });

  await t.step("falls back through reverse holo and normal prices", () => {
    assertEquals(
      extractPokemonPrice(
        pokemonCard({ tcgplayer: { prices: { reverseHolofoil: { market: 4 } } } }),
      ),
      4,
    );
    assertEquals(
      extractPokemonPrice(
        pokemonCard({ tcgplayer: { prices: { normal: { market: 1.5 } } } }),
      ),
      1.5,
    );
  });

  await t.step("uses Cardmarket when TCGplayer has no price", () => {
    const card = pokemonCard({ cardmarket: { prices: { averageSellPrice: 3.2 } } });
    assertEquals(extractPokemonPrice(card), 3.2);
  });

  await t.step("returns null when no source has a price", () => {
    assertEquals(extractPokemonPrice(pokemonCard()), null);
  });
});

const scryfallCard = (overrides: Partial<ScryfallCard> = {}): ScryfallCard => ({
  id: "abc",
  name: "Delver of Secrets",
  set: "isd",
  set_name: "Innistrad",
  collector_number: "51",
  ...overrides,
});

Deno.test("extractScryfallImageUrl", async (t) => {
  await t.step("uses the card's own normal image", () => {
    const card = scryfallCard({
      image_uris: { normal: "normal.jpg", small: "small.jpg" },
    });
    assertEquals(extractScryfallImageUrl(card), "normal.jpg");
  });

  await t.step("uses the front face for double-faced cards", () => {
    const card = scryfallCard({
      card_faces: [
        { image_uris: { normal: "front.jpg" } },
        { image_uris: { normal: "back.jpg" } },
      ],
    });
    assertEquals(extractScryfallImageUrl(card), "front.jpg");
  });

  await t.step("falls back to the small image and finally to an empty string", () => {
    assertEquals(
      extractScryfallImageUrl(scryfallCard({ image_uris: { small: "small.jpg" } })),
      "small.jpg",
    );
    assertEquals(extractScryfallImageUrl(scryfallCard()), "");
  });
});

Deno.test("extractScryfallPrice", async (t) => {
  await t.step("parses USD before foil and EUR prices", () => {
    const card = scryfallCard({ prices: { usd: "1.25", usd_foil: "5.00", eur: "0.90" } });
    assertEquals(extractScryfallPrice(card), 1.25);
  });

  await t.step("falls back to foil, then EUR", () => {
    assertEquals(
      extractScryfallPrice(scryfallCard({ prices: { usd: null, usd_foil: "5.00" } })),
      5,
    );
    assertEquals(
      extractScryfallPrice(scryfallCard({ prices: { usd: null, eur: "0.90" } })),
      0.9,
    );
  });

  await t.step("returns null without prices", () => {
    assertEquals(extractScryfallPrice(scryfallCard()), null);
  });
});

const ygoCard = (prices: Partial<YgoCard["card_prices"][number]>): YgoCard =>
  ({
    id: 89631139,
    name: "Blue-Eyes White Dragon",
    card_prices: [
      {
        tcgplayer_price: "0.00",
        cardmarket_price: "0.00",
        ebay_price: "0.00",
        amazon_price: "0.00",
        ...prices,
      },
    ],
  }) as YgoCard;

Deno.test("extractYgoPrice", async (t) => {
  await t.step("prefers the TCGplayer price", () => {
    assertEquals(
      extractYgoPrice(ygoCard({ tcgplayer_price: "12.50", cardmarket_price: "9.00" })),
      12.5,
    );
  });

  await t.step("treats 0.00 as missing and falls back to Cardmarket", () => {
    assertEquals(extractYgoPrice(ygoCard({ cardmarket_price: "9.00" })), 9);
  });

  await t.step("returns null when every price is 0.00", () => {
    assertEquals(extractYgoPrice(ygoCard({})), null);
  });
});
