export type SubscriptionPackage = {
  identifier: string;
  productId: string;
  title: string;
  price: string;
  period: "monthly" | "yearly";
};

export type SubscriptionStatus = {
  isActive: boolean;
  tier: "free" | "premium" | "pro";
  expiresAt: string | null;
};

export interface IPurchaseService {
  initialize(): Promise<boolean>;
  getOfferings(): Promise<SubscriptionPackage[]>;
  purchasePackage(packageId: string): Promise<boolean>;
  restorePurchases(): Promise<SubscriptionStatus>;
  getSubscriptionStatus(): Promise<SubscriptionStatus>;
}
