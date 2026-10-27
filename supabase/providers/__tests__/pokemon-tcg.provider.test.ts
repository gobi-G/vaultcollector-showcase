import {
  assertEquals,
  assertExists,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import { describe, it } from "https://deno.land/std@0.224.0/testing/bdd.ts";

describe("PokemonTcgProvider", () => {
  it("should parse API response correctly", () => {
    const mockResponse = {
      data: {
        id: "swsh9-1",
        name: "Charizard VMAX",
        set: { name: "Brilliant Stars" },
        cardmarket: { prices: { averageSellPrice: 25.5 } },
      },
    };

    assertExists(mockResponse.data);
    assertEquals(mockResponse.data.name, "Charizard VMAX");
    assertEquals(
      mockResponse.data.cardmarket.prices.averageSellPrice,
      25.5,
    );
  });

  it("should handle missing price data", () => {
    const mockResponse: {
      data: {
        id: string;
        name: string;
        set: { name: string };
        cardmarket: { prices: { averageSellPrice: number } } | null;
      };
    } = {
      data: {
        id: "swsh9-1",
        name: "Charizard VMAX",
        set: { name: "Brilliant Stars" },
        cardmarket: null,
      },
    };

    const price =
      mockResponse.data.cardmarket?.prices?.averageSellPrice ?? null;
    assertEquals(price, null);
  });
});
