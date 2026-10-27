import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner-native";
import { ArrowLeft, MapPin, Pencil, Tag, Trash2 } from "lucide-react-native";
import { getFullLocationPath } from "@vault-collector/shared";
import { ConfirmSheet, ErrorView, GlassCard } from "@/components/ui";
import { formatCurrency } from "@/utils/FormatCurrency";
import { colors, fontFamily, fontSize, spacing } from "@/constants/theme";
import { useDeleteItem } from "@/hooks/queries";
import { useLocations } from "@/hooks/queries";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { itemRepository } from "@/services";
import type { Item } from "@vault-collector/shared";

export default function ItemDetailScreen() {
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const deleteItem = useDeleteItem();
  const { data: locations } = useLocations();
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);

  const queryClient = useQueryClient();

  const { data: item, isLoading, isError, refetch } = useQuery({
    queryKey: ["item", itemId],
    queryFn: () => itemRepository.getById(itemId),
    enabled: !!itemId,
    initialData: () => {
      const queries = queryClient.getQueriesData<Item[]>({ queryKey: ["items"] });
      for (const [, items] of queries) {
        const found = items?.find((i) => i.id === itemId);
        if (found) return found;
      }
      return undefined;
    },
  });

  const handleDelete = () => {
    deleteItem.mutate(itemId, {
      onSuccess: () => {
        setShowDeleteSheet(false);
        toast.success(t("item.deleted"));
        router.back();
      },
      onError: () => toast.error(t("common.error")),
    });
  };

  const locationPath = item?.location_id && locations
    ? getFullLocationPath(locations, item.location_id)
    : null;

  const conditionLabels: Record<string, string> = {
    mint: t("condition.mint"),
    near_mint: t("condition.nearMint"),
    played: t("condition.played"),
    damaged: t("condition.damaged"),
  };

  const conditionColors: Record<string, string> = {
    mint: colors.success.DEFAULT,
    near_mint: colors.success.light,
    played: colors.warning.DEFAULT,
    damaged: colors.danger.DEFAULT,
  };

  if (isError) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
        <ErrorView onRetry={refetch} />
      </SafeAreaView>
    );
  }

  if (isLoading || !item) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: colors.text.muted }}>{t("common.loading")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const metadata = item.category === "tcg" ? item.metadata : null;

  return (
    <SafeAreaView testID="item-detail-screen" style={{ flex: 1, backgroundColor: colors.background.primary }}>
      {/* Fixed Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm }}>
        <Pressable
          testID="item-detail-back"
          onPress={() => router.back()}
          accessibilityLabel={t("common.back")}
          style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}
        >
          <ArrowLeft size={22} color={colors.text.primary} />
        </Pressable>
        <View style={{ flexDirection: "row", gap: spacing.md }}>
          <Pressable
            testID="item-detail-edit"
            onPress={() => router.push({ pathname: "/(tabs)/collection/edit-item", params: { itemId } })}
            accessibilityLabel={t("common.edit")}
            style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 20, backgroundColor: colors.primary.muted }}
          >
            <Pencil size={18} color={colors.primary.light} />
          </Pressable>
          <Pressable
            testID="item-detail-delete"
            onPress={() => setShowDeleteSheet(true)}
            accessibilityLabel={t("common.delete")}
            style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 20, backgroundColor: colors.danger.muted }}
          >
            <Trash2 size={18} color={colors.danger.DEFAULT} />
          </Pressable>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 160 }}>

        {/* Card Image */}
        {item.image_url && (
          <View style={{ alignItems: "center", marginTop: spacing.lg, marginBottom: spacing.xl }}>
            <Image
              source={{ uri: item.image_url }}
              style={{ width: 240, height: 336, borderRadius: 12 }}
              contentFit="contain"
              placeholder={{ blurhash: "L03u%Vt700WB~qj[j[j[00WB~qof" }}
              transition={200}
            />
          </View>
        )}

        {/* Name + Price */}
        <View style={{ paddingHorizontal: spacing.lg }}>
          <Text testID="item-detail-name" style={{ fontFamily: fontFamily.bold, fontSize: fontSize["3xl"], color: colors.text.primary }}>
            {item.name}
          </Text>

          {metadata && "set_name" in metadata && (
            <Text style={{ fontFamily: fontFamily.regular, fontSize: fontSize.base, color: colors.text.muted, marginTop: spacing.xs }}>
              {metadata.set_name}
            </Text>
          )}

          <View style={{ flexDirection: "row", alignItems: "baseline", gap: spacing.md, marginTop: spacing.md }}>
            <Text testID="item-detail-price" style={{ fontFamily: fontFamily.extrabold, fontSize: fontSize["4xl"], color: colors.text.primary }}>
              {item.current_market_price ? formatCurrency(item.current_market_price) : "—"}
            </Text>
            {item.purchase_price && item.current_market_price && (
              <Text style={{
                fontFamily: fontFamily.semibold,
                fontSize: fontSize.base,
                color: item.current_market_price >= item.purchase_price ? colors.success.DEFAULT : colors.danger.DEFAULT,
              }}>
                {item.current_market_price >= item.purchase_price ? "+" : ""}
                {((item.current_market_price - item.purchase_price) / item.purchase_price * 100).toFixed(1)}%
              </Text>
            )}
          </View>
          {item.current_market_price ? (
            <Text style={{ fontFamily: fontFamily.regular, fontSize: fontSize.xs, color: colors.text.muted, marginTop: spacing.xs }}>
              {t("item.priceSource")}
            </Text>
          ) : null}
        </View>

        {/* Details Cards */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
          {/* Condition */}
          <GlassCard className="flex-row items-center justify-between">
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
              <Tag size={18} color={colors.text.secondary} />
              <Text style={{ fontFamily: fontFamily.medium, fontSize: fontSize.base, color: colors.text.secondary }}>
                {t("item.condition")}
              </Text>
            </View>
            <View style={{
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.xs,
              borderRadius: 8,
              backgroundColor: `${conditionColors[item.condition]}20`,
            }}>
              <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.sm, color: conditionColors[item.condition] }}>
                {conditionLabels[item.condition] ?? item.condition}
              </Text>
            </View>
          </GlassCard>

          {/* Location */}
          {locationPath && (
            <GlassCard className="mt-md flex-row items-center justify-between">
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                <MapPin size={18} color={colors.text.secondary} />
                <Text style={{ fontFamily: fontFamily.medium, fontSize: fontSize.base, color: colors.text.secondary }}>
                  {t("item.location")}
                </Text>
              </View>
              <Text style={{ fontFamily: fontFamily.medium, fontSize: fontSize.sm, color: colors.primary.light, flexShrink: 1 }} numberOfLines={1}>
                {locationPath}
              </Text>
            </GlassCard>
          )}

          {/* Purchase Price */}
          {item.purchase_price && (
            <GlassCard className="mt-md flex-row items-center justify-between">
              <Text style={{ fontFamily: fontFamily.medium, fontSize: fontSize.base, color: colors.text.secondary }}>
                {t("item.purchasePrice")}
              </Text>
              <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.base, color: colors.text.primary }}>
                ${item.purchase_price.toFixed(2)}
              </Text>
            </GlassCard>
          )}

          {/* Market Price */}
          {item.current_market_price && (
            <GlassCard className="mt-md flex-row items-center justify-between">
              <Text style={{ fontFamily: fontFamily.medium, fontSize: fontSize.base, color: colors.text.secondary }}>
                {t("item.marketPrice")}
              </Text>
              <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.base, color: colors.success.DEFAULT }}>
                ${item.current_market_price.toFixed(2)}
              </Text>
            </GlassCard>
          )}

          {/* Metadata */}
          {metadata && "rarity" in metadata && metadata.rarity && (
            <GlassCard className="mt-md flex-row items-center justify-between">
              <Text style={{ fontFamily: fontFamily.medium, fontSize: fontSize.base, color: colors.text.secondary }}>
                Rarity
              </Text>
              <Text style={{ fontFamily: fontFamily.medium, fontSize: fontSize.sm, color: colors.text.primary }}>
                {metadata.rarity}
              </Text>
            </GlassCard>
          )}

          {/* Notes */}
          {item.notes && (
            <GlassCard className="mt-md">
              <Text style={{ fontFamily: fontFamily.medium, fontSize: fontSize.base, color: colors.text.secondary, marginBottom: spacing.sm }}>
                {t("item.notes")}
              </Text>
              <Text style={{ fontFamily: fontFamily.regular, fontSize: fontSize.sm, color: colors.text.primary }}>
                {item.notes}
              </Text>
            </GlassCard>
          )}
        </View>

      </ScrollView>

      <ConfirmSheet
        visible={showDeleteSheet}
        icon="🗑"
        title={t("item.deleteConfirmTitle")}
        message={t("item.deleteConfirmMessage", { name: item.name })}
        confirmLabel={t("common.delete")}
        destructive
        isLoading={deleteItem.isPending}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteSheet(false)}
      />
    </SafeAreaView>
  );
}
