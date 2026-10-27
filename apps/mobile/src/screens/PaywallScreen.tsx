import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner-native";
import { ArrowLeft, Check, Crown, RotateCcw, Zap } from "lucide-react-native";
import { GlassCard } from "@/components/ui";
import { usePurchase } from "@/providers/PurchaseProvider";
import { useProfile } from "@/hooks/queries";
import { colors, fontFamily, fontSize, spacing } from "@/constants/theme";

const PLANS = [
  {
    key: "premium",
    entitlement: "premium",
    features: ["paywall.feature500Items", "paywall.feature5Collections", "paywall.feature50AiScans", "paywall.featureCsvExport"],
    fallbackPrice: "2,99€",
    fallbackYearly: "24,99€",
  },
  {
    key: "pro",
    entitlement: "pro",
    features: ["paywall.featureUnlimitedItems", "paywall.featureUnlimitedCollections", "paywall.featureUnlimitedAiScans", "paywall.featureCsvExport", "paywall.featurePrioritySupport"],
    fallbackPrice: "7,99€",
    fallbackYearly: "69,99€",
  },
];

export default function PaywallScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { packages, isLoading, purchase, restore } = usePurchase();
  const { data: profile } = useProfile();
  const currentTier = (profile?.subscription_tier ?? "free") as "free" | "premium" | "pro";

  const handlePurchase = async (planKey: string) => {
    // Find matching package from RevenueCat
    const pkg = packages.find((p) =>
      p.identifier.toLowerCase().includes(planKey) && p.period === "monthly",
    );

    if (pkg) {
      const success = await purchase(pkg.identifier);
      if (success) {
        toast.success(t("paywall.purchaseSuccess"));
        router.back();
      }
    } else {
      // No RevenueCat packages available (dev mode)
      toast.info(t("paywall.notConfigured"));
    }
  };

  const handleRestore = async () => {
    await restore();
    toast.success(t("paywall.restoreComplete"));
  };

  return (
    <SafeAreaView testID="paywall-screen" style={{ flex: 1, backgroundColor: colors.background.primary }} edges={["top"]}>
      {/* Fixed Header */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingTop: spacing.md, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }}>
        <Pressable
          testID="paywall-back"
          onPress={() => router.back()}
          accessibilityLabel={t("common.back")}
          style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}
        >
          <ArrowLeft size={22} color={colors.text.primary} />
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 160 }}>

        {/* Hero */}
        <View style={{ alignItems: "center", marginBottom: spacing["3xl"] }}>
          <View style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: colors.warning.muted,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: spacing.lg,
          }}>
            <Crown size={32} color={colors.warning.DEFAULT} />
          </View>
          <Text style={{ fontFamily: fontFamily.bold, fontSize: fontSize["3xl"], color: colors.text.primary, textAlign: "center" }}>
            {t("paywall.title")}
          </Text>
          <Text style={{ fontFamily: fontFamily.regular, fontSize: fontSize.base, color: colors.text.muted, textAlign: "center", marginTop: spacing.sm }}>
            {t("paywall.subtitle")}
          </Text>
        </View>

        {/* Free Tier */}
        <GlassCard className="mb-lg" style={{ opacity: currentTier === "free" ? 1 : 0.5 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.md }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
              <Text style={{ fontFamily: fontFamily.bold, fontSize: fontSize.xl, color: colors.text.primary }}>
                {t("paywall.freePlan")}
              </Text>
            </View>
            {currentTier === "free" && (
              <View style={{ backgroundColor: colors.surface.border, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 6 }}>
                <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.xs, color: colors.text.secondary }}>
                  {t("paywall.currentPlan")}
                </Text>
              </View>
            )}
          </View>
          {["paywall.feature50Items", "paywall.feature1Collection", "paywall.feature5AiScans"].map((featureKey) => (
            <View key={featureKey} style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.sm }}>
              <Check size={16} color={colors.text.muted} />
              <Text style={{ fontFamily: fontFamily.regular, fontSize: fontSize.sm, color: colors.text.muted }}>
                {t(featureKey)}
              </Text>
            </View>
          ))}
        </GlassCard>

        {/* Paid Plans */}
        {PLANS.map((plan) => {
          // Try to get real price from RevenueCat, fallback to hardcoded
          const monthlyPkg = packages.find((p) =>
            p.identifier.toLowerCase().includes(plan.key) && p.period === "monthly",
          );
          const yearlyPkg = packages.find((p) =>
            p.identifier.toLowerCase().includes(plan.key) && p.period === "yearly",
          );
          const price = monthlyPkg?.price ?? plan.fallbackPrice;
          const yearlyPrice = yearlyPkg?.price ?? plan.fallbackYearly;

          const isCurrentPlan = currentTier === plan.key;
          const isDowngrade = (currentTier === "pro" && plan.key === "premium");

          return (
            <GlassCard key={plan.key} className="mb-lg" style={{ opacity: isDowngrade ? 0.5 : 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.md }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                  <Zap size={18} color={plan.key === "pro" ? colors.primary.light : colors.warning.DEFAULT} />
                  <Text style={{ fontFamily: fontFamily.bold, fontSize: fontSize.xl, color: colors.text.primary }}>
                    {t(`profile.${plan.key}`)}
                  </Text>
                </View>
                {isCurrentPlan ? (
                  <View style={{ backgroundColor: colors.success.muted, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 6 }}>
                    <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.xs, color: colors.success.DEFAULT }}>
                      {t("paywall.currentPlan")}
                    </Text>
                  </View>
                ) : (
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ fontFamily: fontFamily.bold, fontSize: fontSize.xl, color: colors.text.primary }}>
                      {price}
                      <Text style={{ fontFamily: fontFamily.regular, fontSize: fontSize.sm, color: colors.text.muted }}>
                        /{t("paywall.month")}
                      </Text>
                    </Text>
                    <Text style={{ fontFamily: fontFamily.regular, fontSize: fontSize.xs, color: colors.text.muted }}>
                      {t("paywall.orYearly", { price: yearlyPrice })}
                    </Text>
                  </View>
                )}
              </View>

              {plan.features.map((featureKey) => (
                <View key={featureKey} style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.sm }}>
                  <Check size={16} color={colors.success.DEFAULT} />
                  <Text style={{ fontFamily: fontFamily.regular, fontSize: fontSize.sm, color: colors.text.secondary }}>
                    {t(featureKey)}
                  </Text>
                </View>
              ))}

              {!isCurrentPlan && !isDowngrade && (
                <Pressable
                  testID={`paywall-${plan.key}-btn`}
                  onPress={() => handlePurchase(plan.key)}
                  disabled={isLoading}
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    gap: spacing.sm,
                    paddingVertical: spacing.md,
                    borderRadius: 12,
                    backgroundColor: plan.key === "pro" ? colors.primary.DEFAULT : colors.warning.DEFAULT,
                    marginTop: spacing.lg,
                    opacity: isLoading ? 0.6 : 1,
                  }}
                  accessibilityLabel={t("paywall.subscribe", { plan: t(`profile.${plan.key}`) })}
                >
                  {isLoading && <ActivityIndicator size="small" color={colors.text.primary} />}
                  <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.base, color: colors.text.primary }}>
                    {t("paywall.subscribe", { plan: t(`profile.${plan.key}`) })}
                  </Text>
                </Pressable>
              )}
            </GlassCard>
          );
        })}

        {/* Restore */}
        <Pressable
          testID="paywall-restore-btn"
          onPress={handleRestore}
          disabled={isLoading}
          style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, marginTop: spacing.md }}
        >
          <RotateCcw size={14} color={colors.text.muted} />
          <Text style={{ fontFamily: fontFamily.regular, fontSize: fontSize.sm, color: colors.text.muted }}>
            {t("paywall.restoreHint")}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
