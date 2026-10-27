import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { describe, it } from "https://deno.land/std@0.224.0/testing/bdd.ts";

describe("PriceService", () => {
  describe("calculatePortfolioValue", () => {
    it("should return 0 for empty items", () => {
      const items: { current_market_price: number | null }[] = [];
      const total = items.reduce(
        (sum, item) => sum + (item.current_market_price ?? 0),
        0,
      );
      assertEquals(total, 0);
    });

    it("should sum all item prices", () => {
      const items = [
        { current_market_price: 10.5 },
        { current_market_price: 25.0 },
        { current_market_price: null },
      ];
      const total = items.reduce(
        (sum, item) => sum + (item.current_market_price ?? 0),
        0,
      );
      assertEquals(total, 35.5);
    });
  });
});
