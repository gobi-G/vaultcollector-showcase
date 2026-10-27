import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { Crown, Search } from "lucide-react-native";
import { useRouter } from "expo-router";
import { GlassCard, Input } from "@/components/ui";
import { VariantSelectorSheet } from "@/components/features/VariantSelectorSheet";
import { colors, fontFamily, fontSize, spacing } from "@/constants/theme";
import type { CardSearchResult, TcgType } from "@vault-collector/shared";

type AddItemSearchResultsProps = {
  query: string;
  onQueryChange: (text: string) => void;
  onSearch: () => void;
  isSearching: boolean;
  results: CardSearchResult[] | undefined;
  debouncedQuery: string;
  onSelectCard: (card: CardSearchResult) => void;
  tcgType: TcgType;
  onTcgTypeChange: (type: TcgType) => void;
  tcgTypeLabels: Record<TcgType, string>;
  isLimitReached: boolean;
  currentCount: number;
};

const TCG_TYPES: TcgType[] = ["pokemon", "magic", "yugioh"];

export function AddItemSearchResults({
  query,
  onQueryChange,
  onSearch,
  isSearching,
  results,
  debouncedQuery,
  onSelectCard,
  tcgType,
  onTcgTypeChange,
  tcgTypeLabels,
  isLimitReached,
  currentCount,
}: AddItemSearchResultsProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [variantCard, setVariantCard] = useState<CardSearchResult | null>(null);

  if (isLimitReached) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.warning.muted, alignItems: "center", justifyContent: "center", marginBottom: spacing.lg }}>
          <Crown size={32} color={colors.warning.DEFAULT} />
        </View>
        <Text style={{ fontFamily: fontFamily.bold, fontSize: fontSize.xl, color: colors.text.primary, textAlign: "center" }}>
          {t("paywall.limitReached")}
        </Text>
        <Text style={{ fontFamily: fontFamily.regular, fontSize: fontSize.sm, color: colors.text.muted, textAlign: "center", marginTop: spacing.sm, paddingHorizontal: spacing.xl }}>
          {t("paywall.limitMessage", { count: currentCount })}
        </Text>
        <Pressable
          testID="add-item-upgrade-btn"
          onPress={() => router.push("/paywall")}
          style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.xl, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: 12, backgroundColor: colors.warning.DEFAULT }}
          accessibilityLabel={t("profile.upgrade")}
        >
          <Crown size={18} color={colors.text.primary} />
          <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.base, color: colors.text.primary }}>
            {t("profile.upgrade")}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      {/* TCG Type Selector */}
      <View style={{ flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg }}>
        {TCG_TYPES.map((type) => (
          <Pressable
            key={type}
            testID={`tcg-type-${type}`}
            onPress={() => onTcgTypeChange(type)}
            style={{
              flex: 1,
              alignItems: "center",
              paddingVertical: spacing.sm,
              borderRadius: 8,
              backgroundColor: tcgType === type ? colors.primary.DEFAULT : colors.surface.default,
              borderWidth: 1,
              borderColor: tcgType === type ? colors.primary.DEFAULT : colors.surface.border,
            }}
            accessibilityLabel={tcgTypeLabels[type]}
          >
            <Text style={{
              fontFamily: fontFamily.semibold,
              fontSize: fontSize.sm,
              color: tcgType === type ? colors.text.primary : colors.text.muted,
            }}>
              {tcgTypeLabels[type]}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Search Input */}
      <View style={{ flexDirection: "row", gap: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Input
            testID="add-item-search-input"
            value={query}
            onChangeText={onQueryChange}
            placeholder={t(`item.searchPlaceholder_${tcgType}`)}
            onSubmitEditing={onSearch}
            returnKeyType="search"
            accessibilityLabel={t("item.searchCard")}
          />
        </View>
        <Pressable
          testID="add-item-search-btn"
          onPress={onSearch}
          style={{
            width: 48,
            height: 48,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 12,
            backgroundColor: colors.primary.DEFAULT,
          }}
          accessibilityLabel={t("common.search")}
        >
          <Search size={20} color={colors.text.primary} />
        </Pressable>
      </View>

      {/* Loading */}
      {isSearching && (
        <View style={{ marginTop: spacing.xl, alignItems: "center" }}>
          <ActivityIndicator color={colors.primary.DEFAULT} />
        </View>
      )}

      {/* Results */}
      {results && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.cardApiId}
          contentContainerStyle={{ paddingTop: spacing.lg }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          renderItem={({ item, index }) => {
            const hasVariants = (item.setVersions && item.setVersions.length > 1) ||
              (item.artworkImages && item.artworkImages.length > 1);
            const versions = item.setVersions ?? [];

            const priceRange = hasVariants && versions.length > 1 ? (() => {
              const prices = versions.map((v) => v.price).filter((p): p is number => p !== null && p > 0);
              if (prices.length === 0) return null;
              return { min: Math.min(...prices), max: Math.max(...prices) };
            })() : null;

            return (
              <Pressable
                testID={`search-result-${index}`}
                onPress={() => {
                  if (hasVariants) {
                    setVariantCard(item);
                  } else {
                    onSelectCard(item);
                  }
                }}
              >
                <GlassCard className="flex-row items-center gap-md">
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={{ width: 56, height: 78, borderRadius: 6 }}
                    contentFit="contain"
                    placeholder={{ blurhash: "L03u%Vt700WB~qj[j[j[00WB~qof" }}
                    transition={200}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.base, color: colors.text.primary }} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
                      {item.setCode ? (
                        <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.xs, color: colors.primary.light }}>
                          [{item.setCode}]
                        </Text>
                      ) : null}
                      <Text style={{ fontFamily: fontFamily.regular, fontSize: fontSize.sm, color: colors.text.muted, flex: 1 }} numberOfLines={1}>
                        {item.setName}
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: 2 }}>
                      {item.passcode ? (
                        <Text style={{ fontFamily: fontFamily.regular, fontSize: fontSize.xs, color: colors.text.muted }}>
                          #{item.passcode}
                        </Text>
                      ) : null}
                      {hasVariants ? (
                        <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.xs, color: colors.primary.light }}>
                          {t("item.versions", { count: versions.length })}
                        </Text>
                      ) : item.rarity ? (
                        <Text style={{ fontFamily: fontFamily.regular, fontSize: fontSize.xs, color: colors.text.muted }}>
                          {item.rarity}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    {hasVariants && priceRange ? (
                      <Text style={{ fontFamily: fontFamily.regular, fontSize: fontSize.xs, color: colors.text.muted }}>
                        ${priceRange.min.toFixed(2)} – ${priceRange.max.toFixed(2)}
                      </Text>
                    ) : (
                      <Text style={{ fontFamily: fontFamily.bold, fontSize: fontSize.base, color: item.price ? colors.success.DEFAULT : colors.text.muted }}>
                        {item.price ? `$${item.price.toFixed(2)}` : "\u2014"}
                      </Text>
                    )}
                  </View>
                </GlassCard>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            !isSearching && debouncedQuery ? (
              <GlassCard className="items-center">
                <Text className="font-sans text-base text-text-muted">
                  {t("scan.notFound")}
                </Text>
              </GlassCard>
            ) : null
          }
        />
      )}

      {variantCard && (
        <VariantSelectorSheet
          visible
          card={variantCard}
          onSelect={(card) => {
            setVariantCard(null);
            onSelectCard(card);
          }}
          onClose={() => setVariantCard(null)}
        />
      )}
    </>
  );
}
