import { describe, expect, it } from "vitest";
import {
  canAddCollection,
  canAddItem,
  getItemLimitPercentage,
  TIER_LIMITS,
} from "../src/utils/TierLimits";

describe("canAddItem", () => {
  it("allows adding below the free limit and blocks at the limit", () => {
    const max = TIER_LIMITS.free.maxItems;
    expect(canAddItem("free", max - 1)).toBe(true);
    expect(canAddItem("free", max)).toBe(false);
  });

  it("never blocks the pro tier", () => {
    expect(canAddItem("pro", 1_000_000)).toBe(true);
  });
});

describe("canAddCollection", () => {
  it("enforces the premium collection limit", () => {
    const max = TIER_LIMITS.premium.maxCollections;
    expect(canAddCollection("premium", max - 1)).toBe(true);
    expect(canAddCollection("premium", max)).toBe(false);
  });
});

describe("getItemLimitPercentage", () => {
  it("reports usage relative to the tier limit", () => {
    expect(getItemLimitPercentage("free", TIER_LIMITS.free.maxItems / 2)).toBe(50);
  });

  it("caps at 100 when the user is over the limit (e.g. after a downgrade)", () => {
    expect(getItemLimitPercentage("free", TIER_LIMITS.free.maxItems * 3)).toBe(100);
  });

  it("returns 0 for unlimited tiers", () => {
    expect(getItemLimitPercentage("pro", 10_000)).toBe(0);
  });
});

describe("tier ordering", () => {
  it("never gives a higher tier fewer resources than a lower one", () => {
    const tiers = ["free", "premium", "pro"] as const;
    for (let i = 1; i < tiers.length; i++) {
      const lower = TIER_LIMITS[tiers[i - 1]];
      const higher = TIER_LIMITS[tiers[i]];
      expect(higher.maxItems).toBeGreaterThanOrEqual(lower.maxItems);
      expect(higher.maxCollections).toBeGreaterThanOrEqual(lower.maxCollections);
      expect(higher.maxAiScans).toBeGreaterThanOrEqual(lower.maxAiScans);
    }
  });
});
