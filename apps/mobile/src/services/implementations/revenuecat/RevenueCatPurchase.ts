import Purchases, {
  type CustomerInfo,
  LOG_LEVEL,
  type PurchasesPackage,
} from "react-native-purchases";
import { Platform } from "react-native";
import type {
  IPurchaseService,
  SubscriptionPackage,
  SubscriptionStatus,
} from "../../interfaces/PurchaseInterface";
import { logger } from "@/utils/Logger";

// TODO: Replace with real RevenueCat API keys from env
const REVENUECAT_IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? "";
const REVENUECAT_ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? "";

function mapCustomerInfoToStatus(info: CustomerInfo): SubscriptionStatus {
  const activeEntitlements = info.entitlements.active;

  if (activeEntitlements.pro) {
    return {
      isActive: true,
      tier: "pro",
      expiresAt: activeEntitlements.pro.expirationDate,
    };
  }

  if (activeEntitlements.premium) {
    return {
      isActive: true,
      tier: "premium",
      expiresAt: activeEntitlements.premium.expirationDate,
    };
  }

  return { isActive: false, tier: "free", expiresAt: null };
}

function mapPackage(pkg: PurchasesPackage): SubscriptionPackage {
  const isYearly = pkg.packageType === "ANNUAL";
  return {
    identifier: pkg.identifier,
    productId: pkg.product.identifier,
    title: pkg.product.title,
    price: pkg.product.priceString,
    period: isYearly ? "yearly" : "monthly",
  };
}

export const revenueCatPurchase: IPurchaseService = {
  async initialize(): Promise<boolean> {
    const apiKey = Platform.OS === "ios" ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;

    if (!apiKey) {
      logger.warn("Purchase", "RevenueCat API key not set — purchases disabled");
      return false;
    }

    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    await Purchases.configure({ apiKey });
    logger.info("Purchase", "RevenueCat initialized", { platform: Platform.OS });
    return true;
  },

  async getOfferings(): Promise<SubscriptionPackage[]> {
    try {
      const offerings = await Purchases.getOfferings();
      const current = offerings.current;

      if (!current) {
        logger.warn("Purchase", "No current offering found");
        return [];
      }

      return current.availablePackages.map(mapPackage);
    } catch (error) {
      logger.error("Purchase", "Failed to get offerings", {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  },

  async purchasePackage(packageId: string): Promise<boolean> {
    try {
      const offerings = await Purchases.getOfferings();
      const pkg = offerings.current?.availablePackages.find(
        (p) => p.identifier === packageId,
      );

      if (!pkg) {
        logger.error("Purchase", "Package not found", { packageId });
        return false;
      }

      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const status = mapCustomerInfoToStatus(customerInfo);
      logger.info("Purchase", "Purchase successful", { tier: status.tier });
      return status.isActive;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      // User cancelled is not an error
      if (message.includes("cancelled") || message.includes("canceled")) {
        logger.info("Purchase", "User cancelled purchase");
        return false;
      }
      logger.error("Purchase", "Purchase failed", { error: message });
      return false;
    }
  },

  async restorePurchases(): Promise<SubscriptionStatus> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      const status = mapCustomerInfoToStatus(customerInfo);
      logger.info("Purchase", "Restore complete", { tier: status.tier });
      return status;
    } catch (error) {
      logger.error("Purchase", "Restore failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return { isActive: false, tier: "free", expiresAt: null };
    }
  },

  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return mapCustomerInfoToStatus(customerInfo);
    } catch (error) {
      logger.error("Purchase", "Failed to get status", {
        error: error instanceof Error ? error.message : String(error),
      });
      return { isActive: false, tier: "free", expiresAt: null };
    }
  },
};
