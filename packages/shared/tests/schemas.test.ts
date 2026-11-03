import { describe, expect, it } from "vitest";
import { CollectionInsertSchema, ItemInsertSchema } from "../src/schemas";

const USER_ID = "00000000-0000-4000-8000-000000000001";
const COLLECTION_ID = "00000000-0000-4000-8000-000000000002";

const validTcgItem = {
  category: "tcg",
  collection_id: COLLECTION_ID,
  user_id: USER_ID,
  name: "Charizard VMAX",
  condition: "near_mint",
  location_id: null,
  purchase_price: 120,
  current_market_price: null,
  image_url: "https://images.pokemontcg.io/swsh3/20.png",
  notes: null,
  metadata: {
    card_api_id: "swsh3-20",
    set_name: "Darkness Ablaze",
    card_number: "020/189",
    tcg_type: "pokemon",
  },
};

describe("ItemInsertSchema", () => {
  it("accepts a valid trading card", () => {
    expect(ItemInsertSchema.safeParse(validTcgItem).success).toBe(true);
  });

  it("rejects negative prices", () => {
    const result = ItemInsertSchema.safeParse({ ...validTcgItem, purchase_price: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects an empty name", () => {
    expect(ItemInsertSchema.safeParse({ ...validTcgItem, name: "" }).success).toBe(false);
  });

  it("rejects an unknown condition", () => {
    expect(
      ItemInsertSchema.safeParse({ ...validTcgItem, condition: "like_new" }).success,
    ).toBe(false);
  });

  it("validates metadata against the category (TCG metadata needs a set name)", () => {
    const { set_name: _setName, ...metadataWithoutSet } = validTcgItem.metadata;
    const result = ItemInsertSchema.safeParse({
      ...validTcgItem,
      metadata: metadataWithoutSet,
    });
    expect(result.success).toBe(false);
  });

  it("rejects grading scores outside 1–10", () => {
    const result = ItemInsertSchema.safeParse({
      ...validTcgItem,
      metadata: { ...validTcgItem.metadata, grading_company: "psa", grading_score: 11 },
    });
    expect(result.success).toBe(false);
  });
});

describe("CollectionInsertSchema", () => {
  const validCollection = {
    user_id: USER_ID,
    name: "Pokémon Binder",
    description: null,
    category: "tcg",
    cover_image_url: null,
  };

  it("accepts a valid collection", () => {
    expect(CollectionInsertSchema.safeParse(validCollection).success).toBe(true);
  });

  it("rejects names longer than 100 characters", () => {
    const result = CollectionInsertSchema.safeParse({
      ...validCollection,
      name: "x".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-uuid user id", () => {
    const result = CollectionInsertSchema.safeParse({
      ...validCollection,
      user_id: "user-1",
    });
    expect(result.success).toBe(false);
  });
});
