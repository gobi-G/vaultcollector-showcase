import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Lock, RefreshCw, Settings } from "lucide-react-native";
import { ErrorView, GlassCard, SkeletonCard, SkeletonRow } from "@/components/ui";
import { AssetRow, FirstScanBanner, PortfolioCard } from "@/components/features";
import { colors } from "@/constants/theme";
import { formatCurrencyCompact } from "@/utils/FormatCurrency";
import {
  useAllUserItems,
  useCollections,
  useLocations,
  useProfile,
  useSyncPrices,
} from "@/hooks/queries";
import { useRefetchOnFocus } from "@/hooks/useRefetchOnFocus";
import type { TcgType } from "@vault-collector/shared";

function useGreeting(): string {
  const { t } = useTranslation();
  const hour = new Date().getHours();
  if (hour < 12) return t("greeting.morning");
  if (hour < 18) return t("greeting.afternoon");
  return t("greeting.evening");
}

type CategoryStats = {
  count: number;
  value: number;
};

type TcgSubStats = Record<TcgType, CategoryStats>;

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const greeting = useGreeting();
  const profileQuery = useProfile();
  const itemsQuery = useAllUserItems();
  const collectionsQuery = useCollections();
  const locationsQuery = useLocations();
  const syncPrices = useSyncPrices();
  useRefetchOnFocus(profileQuery, itemsQuery, collectionsQuery);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      profileQuery.refetch(),
      itemsQuery.refetch(),
      collectionsQuery.refetch(),
    ]);
    setRefreshing(false);
  }, [profileQuery, itemsQuery, collectionsQuery]);

  const profile = profileQuery.data;
  const allItems = itemsQuery.data;
  const collections = collectionsQuery.data;

  const displayName = profile?.display_name ?? profile?.email?.split("@")[0] ?? "";

  const stats = useMemo(() => {
    const categoryStats: Record<string, CategoryStats> = {
      tcg: { count: 0, value: 0 },
      lego: { count: 0, value: 0 },
      watch: { count: 0, value: 0 },
    };
    const tcgSubStats: TcgSubStats = {
      pokemon: { count: 0, value: 0 },
      magic: { count: 0, value: 0 },
      yugioh: { count: 0, value: 0 },
    };
    let totalValue = 0;
    let totalPurchase = 0;
    let itemsWithPurchasePrice = 0;

    if (allItems) {
      for (const item of allItems) {
        const cat = item.category ?? "tcg";
        if (!categoryStats[cat]) categoryStats[cat] = { count: 0, value: 0 };
        categoryStats[cat].count++;
        categoryStats[cat].value += item.current_market_price ?? 0;
        totalValue += item.current_market_price ?? 0;
        if (item.purchase_price && item.purchase_price > 0) {
          totalPurchase += item.purchase_price;
          itemsWithPurchasePrice++;
        }

        if (cat === "tcg") {
          const metadata = item.metadata as { tcg_type?: TcgType } | null;
          const tcgType: TcgType = metadata?.tcg_type ?? "pokemon";
          tcgSubStats[tcgType].count++;
          tcgSubStats[tcgType].value += item.current_market_price ?? 0;
        }
      }
    }

    const hasReturn = itemsWithPurchasePrice > 0;
    const changeValue = hasReturn ? totalValue - totalPurchase : 0;
    const changePercentage =
      hasReturn && totalPurchase > 0 ? (changeValue / totalPurchase) * 100 : 0;
    const itemCount = allItems?.length ?? 0;

    return {
      categoryStats,
      tcgSubStats,
      totalValue,
      changeValue,
      changePercentage,
      itemCount,
      hasReturn,
    };
  }, [allItems]);

  const hasItems = stats.itemCount > 0;
  const hasError = itemsQuery.isError || profileQuery.isError || collectionsQuery.isError;

  if (hasError) {
    return (
      <SafeAreaView testID="tabs-home" className="flex-1 bg-bg-primary" edges={["top"]}>
        <ErrorView
          onRetry={() => {
            profileQuery.refetch();
            itemsQuery.refetch();
            collectionsQuery.refetch();
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView testID="tabs-home" className="flex-1 bg-bg-primary" edges={["top"]}>
      {/* Fixed Header */}
      <View style={{
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12,
        marginHorizontal: 16, marginTop: 8, marginBottom: 8,
        backgroundColor: colors.surface.default,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.surface.border,
      }}>
        <View>
          <Text testID="home-greeting" className="font-sans text-sm text-text-muted">
            {greeting}
          </Text>
          <Text
            testID="home-username"
            className="font-sans-bold text-xl text-text-primary"
          >
            {displayName}
          </Text>
        </View>
        <Pressable
          testID="home-settings-btn"
          onPress={() => router.push("/(tabs)/profile")}
          accessibilityLabel={t("common.settings")}
          style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: colors.background.tertiary }}
        >
          <Settings size={20} color={colors.text.secondary} />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1 px-lg"
        contentContainerStyle={{ paddingBottom: 160 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary.DEFAULT}
            colors={[colors.primary.DEFAULT]}
          />
        }
      >
        {/* Skeleton Loading */}
        {itemsQuery.isLoading || profileQuery.isLoading ? (
          <View style={{ gap: 16, marginTop: 24 }}>
            <SkeletonCard />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </View>
        ) : null}

        {/* Portfolio */}
        {!itemsQuery.isLoading && (
          <PortfolioCard
            totalValue={stats.totalValue}
            changeValue={stats.changeValue}
            changePercentage={stats.changePercentage}
            itemCount={stats.itemCount}
            hasReturn={stats.hasReturn}
            className="mt-xl"
          />
        )}

        {/* Refresh Prices */}
        {hasItems && (
          <Pressable
            testID="home-refresh-prices-btn"
            onPress={() => syncPrices.mutate()}
            disabled={syncPrices.isPending}
            accessibilityLabel={t("portfolio.refreshPrices")}
            className="mt-md flex-row items-center justify-center gap-sm rounded-md bg-primary-muted px-lg py-sm"
          >
            {syncPrices.isPending ? (
              <ActivityIndicator size="small" color={colors.primary.light} />
            ) : (
              <RefreshCw size={16} color={colors.primary.light} />
            )}
            <Text className="font-sans-semibold text-sm text-primary-light">
              {syncPrices.isPending
                ? t("portfolio.refreshing")
                : syncPrices.isSuccess
                  ? t("portfolio.refreshed")
                  : t("portfolio.refreshPrices")}
            </Text>
          </Pressable>
        )}

        {/* My Assets */}
        <Text className="mb-md mt-xl font-sans-semibold text-lg text-text-primary">
          {t("portfolio.myAssets")}
        </Text>
        <GlassCard>
          {/* TCG Sub-categories — always show all 3 */}
          {([
            { key: "pokemon" as const, icon: "🃏", label: t("categories.pokemonTcg") },
            { key: "magic" as const, icon: "✨", label: t("categories.magicTcg") },
            { key: "yugioh" as const, icon: "🌀", label: t("categories.yugiohTcg") },
          ]).map(({ key, icon, label }, idx) => (
            <View key={key}>
              <AssetRow
                icon={icon}
                label={label}
                sublabel={t("collection.itemCount", { count: stats.tcgSubStats[key].count })}
                value={formatCurrencyCompact(stats.tcgSubStats[key].value)}
                change={`${stats.tcgSubStats[key].count}`}
                changePositive={stats.tcgSubStats[key].value > 0}
              />
              {idx < 2 && <View className="border-b border-surface-border" />}
            </View>
          ))}
          <View className="border-b border-surface-border" />
          <View style={{ opacity: 0.5 }}>
            <AssetRow
              icon="🧱"
              label={t("categories.legoSets")}
              sublabel={t("comingSoon")}
              value=""
              change=""
              changePositive
            />
          </View>
          <View className="border-b border-surface-border" />
          <View style={{ opacity: 0.5 }}>
            <AssetRow
              icon="⌚"
              label={t("categories.watches")}
              sublabel={t("comingSoon")}
              value=""
              change=""
              changePositive
            />
          </View>
        </GlassCard>

        {/* Vault Hint (only when no locations) */}
        {locationsQuery.data && locationsQuery.data.length === 0 && (
          <Pressable
            testID="home-vault-hint"
            onPress={() => router.push("/vault")}
          >
            <GlassCard className="mt-lg flex-row items-center gap-md">
              <View style={{ width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary.muted }}>
                <Lock size={20} color={colors.primary.light} />
              </View>
              <View className="flex-1">
                <Text className="font-sans-semibold text-base text-text-primary">
                  {t("vault.setupTitle")}
                </Text>
                <Text className="mt-xs font-sans text-xs text-text-muted">
                  {t("vault.setupHint")}
                </Text>
              </View>
            </GlassCard>
          </Pressable>
        )}

        {/* Recent Collections */}
        {hasItems && collections && collections.length > 0 && (
          <>
            <Text className="mb-md mt-xl font-sans-semibold text-lg text-text-primary">
              {t("collection.myCollection")}
            </Text>
            {collections.slice(0, 3).map((col) => (
              <Pressable
                key={col.id}
                testID={`home-collection-${col.id}`}
                onPress={() => router.push(`/(tabs)/collection/${col.id}`)}
              >
                <GlassCard className="mb-md flex-row items-center gap-md">
                  <Text style={{ fontSize: 24 }}>
                    {(col as { category?: string }).category === "lego"
                      ? "🧱"
                      : (col as { category?: string }).category === "watch"
                        ? "⌚"
                        : "🃏"}
                  </Text>
                  <View className="flex-1">
                    <Text className="font-sans-semibold text-base text-text-primary">
                      {col.name}
                    </Text>
                  </View>
                </GlassCard>
              </Pressable>
            ))}
          </>
        )}

        {/* Empty State */}
        {!hasItems && (
          <FirstScanBanner onPress={() => router.push("/(tabs)/scan")} />
        )}

        <View className="h-5xl" />
      </ScrollView>
    </SafeAreaView>
  );
}
