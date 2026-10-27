import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner-native";
import { Boxes, CreditCard, FolderOpen, Plus, Trash2, Watch } from "lucide-react-native";
import { Badge, ConfirmSheet, ErrorView, GlassCard } from "@/components/ui";
import { colors } from "@/constants/theme";
import { formatCurrencyCompact } from "@/utils/FormatCurrency";
import { useAllUserItems, useCollections, useDeleteCollection, useProfile } from "@/hooks/queries";
import { canAddCollection } from "@vault-collector/shared";

const CATEGORY_CONFIG: Record<string, { icon: typeof CreditCard; color: string; bg: string }> = {
  tcg: { icon: CreditCard, color: colors.primary.light, bg: "bg-primary-muted" },
  lego: { icon: Boxes, color: colors.warning.light, bg: "bg-warning-muted" },
  watch: { icon: Watch, color: colors.danger.light, bg: "bg-danger-muted" },
};

export default function CollectionListScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const collectionsQuery = useCollections();
  const { data: collections, isLoading } = collectionsQuery;
  const { data: allItems } = useAllUserItems();
  const { data: profile } = useProfile();
  const deleteCollection = useDeleteCollection();
  const tier = (profile?.subscription_tier ?? "free") as "free" | "premium" | "pro";
  const collectionCount = collections?.length ?? 0;
  const isLimitReached = !canAddCollection(tier, collectionCount);

  const collectionStats = useMemo(() => {
    if (!allItems) return {};
    const stats: Record<string, { count: number; value: number }> = {};
    for (const item of allItems) {
      if (!stats[item.collection_id]) {
        stats[item.collection_id] = { count: 0, value: 0 };
      }
      stats[item.collection_id].count++;
      stats[item.collection_id].value += item.current_market_price ?? 0;
    }
    return stats;
  }, [allItems]);

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteCollection.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success(t("collection.deleted", { name: deleteTarget.name }));
        setDeleteTarget(null);
      },
      onError: () => toast.error(t("common.error")),
    });
  };

  return (
    <SafeAreaView testID="tabs-collection" className="flex-1 bg-bg-primary" edges={["top"]}>
      {/* Fixed Header */}
      {collectionsQuery.isError && (
        <ErrorView onRetry={() => collectionsQuery.refetch()} />
      )}

      <View className="flex-row items-center justify-between px-lg pt-md pb-sm">
        <Text className="font-sans-bold text-2xl text-text-primary">
          {t("collection.myCollection")}
        </Text>
        <Pressable
          testID="collection-create-btn"
          onPress={() => {
            if (isLimitReached) {
              toast.error(t("collection.limitReached"));
              router.push("/paywall");
              return;
            }
            router.push("/(tabs)/collection/create");
          }}
          className="h-[36px] w-[36px] items-center justify-center rounded-full bg-primary"
          accessibilityLabel={t("collection.createCollection")}
        >
          <Plus size={20} color={colors.text.primary} />
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-lg" contentContainerStyle={{ paddingBottom: 160 }} showsVerticalScrollIndicator={false}>
        {/* Loading */}
        {isLoading && (
          <View className="mt-xl items-center">
            <ActivityIndicator color={colors.primary.DEFAULT} />
          </View>
        )}

        {/* Empty State */}
        {!isLoading && (!collections || collections.length === 0) && (
          <GlassCard className="mt-xl items-center">
            <FolderOpen size={48} color={colors.text.muted} />
            <Text className="mt-md font-sans-semibold text-base text-text-primary">
              {t("collection.empty")}
            </Text>
            <Text className="mt-xs font-sans text-sm text-text-muted">
              {t("collection.emptyHint")}
            </Text>
          </GlassCard>
        )}
          {collections?.map((collection) => {
            const category = (collection as { category?: string }).category ?? "tcg";
            const config = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG["tcg"];
            const Icon = config.icon;
            const stats = collectionStats[collection.id];
            const itemCount = stats?.count ?? 0;
            const totalValue = stats?.value ?? 0;

            return (
              <Pressable
                key={collection.id}
                testID={`collection-item-${collection.id}`}
                onPress={() => router.push(`/(tabs)/collection/${collection.id}`)}
              >
                <GlassCard className="mt-md flex-row items-center gap-lg">
                  <View className={`h-[48px] w-[48px] items-center justify-center rounded-lg ${config.bg}`}>
                    <Icon size={24} color={config.color} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-sans-semibold text-base text-text-primary">
                      {collection.name}
                    </Text>
                    <Text className="font-sans text-sm text-text-muted">
                      {t("collection.itemCount", { count: itemCount })}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-sm">
                    <Badge
                      label={formatCurrencyCompact(totalValue)}
                      variant={totalValue > 0 ? "success" : "default"}
                    />
                    <Pressable
                      testID={`collection-delete-${collection.id}`}
                      onPress={() => setDeleteTarget({ id: collection.id, name: collection.name })}
                      accessibilityLabel={t("common.delete")}
                      hitSlop={8}
                    >
                      <Trash2 size={16} color={colors.danger.DEFAULT} />
                    </Pressable>
                  </View>
                </GlassCard>
              </Pressable>
            );
          })}

          {/* Create Button */}
          {!isLoading && collections && collections.length > 0 && (
            <Pressable
              testID="collection-create-bottom-btn"
              onPress={() => {
                if (isLimitReached) {
                  toast.error(t("collection.limitReached"));
                  router.push("/paywall");
                  return;
                }
                router.push("/(tabs)/collection/create");
              }}
              className="mt-xl items-center rounded-lg border border-surface-border py-lg"
              accessibilityLabel={t("collection.createCollection")}
            >
              <Text className="font-sans-semibold text-base text-primary-light">
                + {t("collection.createCollection")}
              </Text>
            </Pressable>
          )}
      </ScrollView>

      <ConfirmSheet
        visible={!!deleteTarget}
        title={t("collection.deleteConfirmTitle")}
        message={t("collection.deleteConfirmMessage", { name: deleteTarget?.name ?? "" })}
        confirmLabel={t("common.delete")}
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </SafeAreaView>
  );
}
