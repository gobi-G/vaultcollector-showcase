import type { SubscriptionTier } from "../types/common.types";

export const TIER_LIMITS: Record<SubscriptionTier, {
  maxItems: number;
  maxCollections: number;
  maxAiScans: number;
  priceAlerts: number;
  csvExport: boolean;
}> = {
  free: {
    maxItems: 50,
    maxCollections: 2,
    maxAiScans: 10,
    priceAlerts: 0,
    csvExport: false,
  },
  premium: {
    maxItems: 500,
    maxCollections: 5,
    maxAiScans: 50,
    priceAlerts: 5,
    csvExport: true,
  },
  pro: {
    maxItems: Infinity,
    maxCollections: Infinity,
    maxAiScans: Infinity,
    priceAlerts: Infinity,
    csvExport: true,
  },
};

export function canAddItem(tier: SubscriptionTier, currentCount: number): boolean {
  return currentCount < TIER_LIMITS[tier].maxItems;
}

export function canAddCollection(tier: SubscriptionTier, currentCount: number): boolean {
  return currentCount < TIER_LIMITS[tier].maxCollections;
}

export function getItemLimitPercentage(tier: SubscriptionTier, currentCount: number): number {
  const max = TIER_LIMITS[tier].maxItems;
  if (max === Infinity) return 0;
  return Math.min((currentCount / max) * 100, 100);
}
