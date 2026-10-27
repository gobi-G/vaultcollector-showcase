import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner-native";
import { ArrowLeft, Plus, TrendingDown, TrendingUp } from "lucide-react-native";
import { ErrorView, GlassCard } from "@/components/ui";
import { EditNameModal } from "@/components/features";
import { colors, fontFamily, fontSize, spacing } from "@/constants/theme";
import { formatCurrency } from "@/utils/FormatCurrency";
import { useCollection, useItems, useUpdateCollection } from "@/hooks/queries";

const CATEGORY_ICONS: Record<string, string> = {
  tcg: "🃏",
  lego: "🧱",
  watch: "⌚",
};

export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const collectionQuery = useCollection(id);
  const itemsQuery = useItems(id);
  const collection = collectionQuery.data;
  const items = itemsQuery.data;
  const isLoading = itemsQuery.isLoading;
  const updateCollection = useUpdateCollection();
  const [showEditName, setShowEditName] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([collectionQuery.refetch(), itemsQuery.refetch()]);
    setRefreshing(false);
  }, [collectionQuery, itemsQuery]);

  const stats = useMemo(() => {
    if (!items || items.length === 0) return { count: 0, totalValue: 0, totalPurchase: 0 };
    let totalValue = 0;
    let totalPurchase = 0;
    for (const item of items) {
      totalValue += item.current_market_price ?? 0;
      totalPurchase += item.purchase_price ?? 0;
    }
    return { count: items.length, totalValue, totalPurchase };
  }, [items]);

  const changePercent = stats.totalPurchase > 0
    ? ((stats.totalValue - stats.totalPurchase) / stats.totalPurchase) * 100
    : 0;
  const isPositive = changePercent >= 0;

  const handleSaveName = (name: string) => {
    if (!name || !id) return;
    updateCollection.mutate(
      { id, name },
      {
        onSuccess: () => {
          toast.success(t("collection.updated"));
          setShowEditName(false);
        },
        onError: () => toast.error(t("common.error")),
      },
    );
  };

  const categoryIcon = CATEGORY_ICONS[(collection as { category?: string })?.category ?? "tcg"] ?? "🃏";

  return (
    <SafeAreaView testID="collection-detail" style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <View style={{ flex: 1 }}>
        {/* AppBar */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xs }}>
          <Pressable
            testID="collection-detail-back"
            onPress={() => router.back()}
            accessibilityLabel={t("common.back")}
            style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}
          >
            <ArrowLeft size={22} color={colors.text.primary} />
          </Pressable>
          <View style={{ flex: 1 }} />
        </View>

        {/* Collection Header Card */}
        <Pressable
          testID="collection-edit-name"
          onPress={() => setShowEditName(true)}
          accessibilityLabel={t("common.edit")}
          style={{ marginHorizontal: spacing.lg }}
        >
          <GlassCard elevated>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
              <View style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: colors.primary.muted,
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Text style={{ fontSize: 24 }}>{categoryIcon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontFamily: fontFamily.bold, fontSize: fontSize.xl, color: colors.text.primary }}
                  numberOfLines={1}
                >
                  {collection?.name ?? ""}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginTop: spacing.xs }}>
                  <Text style={{ fontFamily: fontFamily.regular, fontSize: fontSize.sm, color: colors.text.muted }}>
                    {stats.count} {t("portfolio.items")}
                  </Text>
                  {stats.totalValue > 0 ? (
                    <>
                      <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.sm, color: colors.text.primary }}>
                        ${stats.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                        {isPositive ? (
                          <TrendingUp size={12} color={colors.success.DEFAULT} />
                        ) : (
                          <TrendingDown size={12} color={colors.danger.DEFAULT} />
                        )}
                        <Text style={{
                          fontFamily: fontFamily.semibold,
                          fontSize: fontSize.xs,
                          color: isPositive ? colors.success.DEFAULT : colors.danger.DEFAULT,
                        }}>
                          {isPositive ? "+" : ""}{changePercent.toFixed(1)}%
                        </Text>
                      </View>
                    </>
                  ) : null}
                </View>
              </View>
            </View>
          </GlassCard>
        </Pressable>

        {/* Error */}
        {itemsQuery.isError && (
          <ErrorView onRetry={() => itemsQuery.refetch()} />
        )}

        {/* Loading */}
        {isLoading && !itemsQuery.isError && (
          <View style={{ marginTop: spacing.xl, alignItems: "center" }}>
            <ActivityIndicator color={colors.primary.DEFAULT} />
          </View>
        )}

        {/* Empty State */}
        {!isLoading && (!items || items.length === 0) && (
          <View style={{ paddingHorizontal: spacing.lg }}>
            <GlassCard className="mt-xl items-center">
              <Text className="font-sans-semibold text-base text-text-primary">
                {t("collection.noItems")}
              </Text>
              <Text className="mt-xs font-sans text-sm text-text-muted">
                {t("collection.addFirstItem")}
              </Text>
            </GlassCard>
          </View>
        )}

        {/* Items Grid */}
        {items && items.length > 0 && (
          <FlatList
            data={items}
            numColumns={2}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: insets.bottom + 100 }}
            columnWrapperStyle={{ gap: spacing.md }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary.DEFAULT}
                colors={[colors.primary.DEFAULT]}
              />
            }
            ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
            renderItem={({ item }) => (
              <Pressable
                testID={`item-card-${item.id}`}
                style={{ flex: 1 }}
                onPress={() => router.push(`/(tabs)/collection/item-detail?itemId=${item.id}`)}
              >
                <GlassCard className="items-center">
                  {item.image_url ? (
                    <Image
                      source={{ uri: item.image_url }}
                      style={{ width: "100%", height: 160, borderRadius: 8 }}
                      contentFit="contain"
                      placeholder={{ blurhash: "L03u%Vt700WB~qj[j[j[00WB~qof" }}
                      transition={200}
                    />
                  ) : (
                    <View style={{ width: "100%", height: 160, borderRadius: 8, backgroundColor: colors.primary.muted, alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ fontSize: 40 }}>{categoryIcon}</Text>
                    </View>
                  )}
                  <Text
                    className="mt-sm font-sans-semibold text-sm text-text-primary"
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text className="font-sans text-xs text-text-muted" numberOfLines={1}>
                    {item.current_market_price ? formatCurrency(item.current_market_price) : "—"}
                  </Text>
                </GlassCard>
              </Pressable>
            )}
          />
        )}
      </View>

      {/* FAB — Add Item */}
      <Pressable
        testID="collection-add-item-btn"
        onPress={() => router.push(`/(tabs)/collection/add-item?collectionId=${id}`)}
        accessibilityLabel={t("item.addItem")}
        style={{
          position: "absolute",
          bottom: 100,
          right: spacing.xl,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.primary.DEFAULT,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: colors.primary.DEFAULT,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Plus size={24} color={colors.text.primary} />
      </Pressable>

      <EditNameModal
        visible={showEditName}
        initialName={collection?.name ?? ""}
        isLoading={updateCollection.isPending}
        onSave={handleSaveName}
        onClose={() => setShowEditName(false)}
      />
    </SafeAreaView>
  );
}
