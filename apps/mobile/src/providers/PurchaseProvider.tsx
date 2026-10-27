import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { revenueCatPurchase } from "@/services/implementations/revenuecat/RevenueCatPurchase";
import type { SubscriptionPackage, SubscriptionStatus } from "@/services/interfaces/PurchaseInterface";
import { supabase } from "@/services/implementations/supabase/SupabaseClient";
import { logger } from "@/utils/Logger";

type PurchaseContextType = {
  status: SubscriptionStatus;
  packages: SubscriptionPackage[];
  isLoading: boolean;
  purchase: (packageId: string) => Promise<boolean>;
  restore: () => Promise<void>;
  refresh: () => Promise<void>;
};

const DEFAULT_STATUS: SubscriptionStatus = {
  isActive: false,
  tier: "free",
  expiresAt: null,
};

const PurchaseContext = createContext<PurchaseContextType | null>(null);

async function syncTierToSupabase(tier: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await (supabase as unknown as { from: (t: string) => { update: (d: Record<string, string>) => { eq: (k: string, v: string) => Promise<unknown> } } })
      .from("profiles")
      .update({ subscription_tier: tier })
      .eq("id", user.id);
    logger.info("Purchase", "Synced tier to Supabase", { tier });
  } catch {
    logger.warn("Purchase", "Failed to sync tier to Supabase");
  }
}

export function PurchaseProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SubscriptionStatus>(DEFAULT_STATUS);
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const isConfigured = await revenueCatPurchase.initialize();
        if (isConfigured) {
          const [currentStatus, offerings] = await Promise.all([
            revenueCatPurchase.getSubscriptionStatus(),
            revenueCatPurchase.getOfferings(),
          ]);
          setStatus(currentStatus);
          setPackages(offerings);
          syncTierToSupabase(currentStatus.tier);
        }
      } catch (error) {
        logger.error("Purchase", "Init failed", {
          error: error instanceof Error ? error.message : String(error),
        });
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const purchase = useCallback(async (packageId: string) => {
    setIsLoading(true);
    try {
      const success = await revenueCatPurchase.purchasePackage(packageId);
      if (success) {
        const newStatus = await revenueCatPurchase.getSubscriptionStatus();
        setStatus(newStatus);
        syncTierToSupabase(newStatus.tier);
      }
      return success;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const restore = useCallback(async () => {
    setIsLoading(true);
    try {
      const restoredStatus = await revenueCatPurchase.restorePurchases();
      setStatus(restoredStatus);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    const newStatus = await revenueCatPurchase.getSubscriptionStatus();
    setStatus(newStatus);
  }, []);

  return (
    <PurchaseContext.Provider value={{ status, packages, isLoading, purchase, restore, refresh }}>
      {children}
    </PurchaseContext.Provider>
  );
}

export function usePurchase(): PurchaseContextType {
  const context = useContext(PurchaseContext);
  if (!context) {
    throw new Error("usePurchase must be used within PurchaseProvider");
  }
  return context;
}
