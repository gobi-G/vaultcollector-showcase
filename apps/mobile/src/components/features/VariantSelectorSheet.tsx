import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { colors, fontFamily, fontSize, spacing } from "@/constants/theme";
import { ArtworkCarousel } from "./ArtworkCarousel";
import type { CardSearchResult } from "@vault-collector/shared";

type VariantSelectorSheetProps = {
  visible: boolean;
  card: CardSearchResult;
  onSelect: (card: CardSearchResult) => void;
  onClose: () => void;
  initialArtworkIndex?: number;
  artworkOnly?: boolean;
};

export function VariantSelectorSheet({
  visible, card, onSelect, onClose,
  initialArtworkIndex = 0,
  artworkOnly = false,
}: VariantSelectorSheetProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<"artwork" | "version">("artwork");
  const [selectedArtworkIndex, setSelectedArtworkIndex] = useState(initialArtworkIndex);
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(0);

  const artworks = card.artworkImages;
  const allVersions = artworkOnly ? [] : (card.setVersions ?? []);
  const hasArtworks = artworks && artworks.length > 0;

  // Filter versions by selected artwork (only when versions have diverse artworkIds — Magic)
  const selectedArtworkId = artworks?.[selectedArtworkIndex]?.id;
  const uniqueArtworkIds = new Set(allVersions.map((v) => v.artworkId).filter(Boolean));
  const canFilterByArtwork = uniqueArtworkIds.size > 1;
  const versions = selectedArtworkId && canFilterByArtwork
    ? allVersions.filter((v) => v.artworkId === selectedArtworkId)
    : allVersions;

  const handleBack = () => {
    if (step === "version") {
      setStep("artwork");
    } else {
      onClose();
    }
  };

  const handleAdd = () => {
    const artworkUrl = artworks?.[selectedArtworkIndex]?.imageUrl ?? card.imageUrl;
    const version = versions[selectedVersionIndex];
    onSelect({
      ...card,
      imageUrl: artworkUrl,
      setName: version?.setName ?? card.setName,
      setCode: version?.setCode ?? card.setCode,
      rarity: version?.rarity ?? card.rarity,
      price: version?.price ?? card.price,
      cardNumber: version?.setCode ?? card.cardNumber,
      setVersions: null,
      artworkImages: null,
    });
  };

  const stepNumber = step === "artwork" ? 1 : 2;
  const totalSteps = versions.length > 0 ? 2 : 1;

  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={handleBack}>
      <View testID="variant-selector-sheet" style={{ flex: 1, backgroundColor: colors.background.primary, paddingTop: insets.top, paddingBottom: insets.bottom }}>
        {/* Header */}
        <View style={{
          flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg,
          paddingTop: spacing.md, paddingBottom: spacing.lg,
        }}>
          <Pressable
            testID="variant-back-btn"
            onPress={handleBack}
            accessibilityLabel={t("common.back")}
          >
            <ArrowLeft size={24} color={colors.text.primary} />
          </Pressable>
          <Text style={{
            flex: 1, fontFamily: fontFamily.bold, fontSize: fontSize.xl,
            color: colors.text.primary, marginLeft: spacing.md,
          }} numberOfLines={1}>
            {card.name}
          </Text>
          {totalSteps > 1 && (
            <Text style={{ fontFamily: fontFamily.regular, fontSize: fontSize.xs, color: colors.text.muted }}>
              {t("variant.step", { current: stepNumber, total: totalSteps })}
            </Text>
          )}
        </View>

        {/* Step 1: Artwork */}
        {step === "artwork" && (
          <Animated.View entering={FadeIn.duration(200)} style={{ flex: 1 }}>
            <View style={{ flex: 1, justifyContent: "center" }}>
              {hasArtworks ? (
                <ArtworkCarousel
                  images={artworks}
                  selectedIndex={selectedArtworkIndex}
                  onSelectIndex={(idx) => { setSelectedArtworkIndex(idx); setSelectedVersionIndex(0); }}
                  size="fullscreen"
                />
              ) : (
                <View style={{ alignItems: "center" }}>
                  <Image
                    source={{ uri: card.imageUrl }}
                    style={{ width: 280, height: 392, borderRadius: 16 }}
                    contentFit="contain"
                    placeholder={{ blurhash: "L03u%Vt700WB~qj[j[j[00WB~qof" }}
                    transition={200}
                  />
                </View>
              )}
            </View>
            <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
              <Pressable
                testID="variant-next-btn"
                onPress={() => versions.length > 0 ? setStep("version") : handleAdd()}
                accessibilityLabel={versions.length > 0 ? t("variant.next") : artworkOnly ? t("variant.confirm") : t("variant.addCard")}
                style={{
                  alignItems: "center", paddingVertical: spacing.lg,
                  borderRadius: 12, backgroundColor: colors.primary.DEFAULT,
                }}
              >
                <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.base, color: colors.text.primary }}>
                  {versions.length > 0 ? t("variant.next") : artworkOnly ? t("variant.confirm") : t("variant.addCard")}
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        )}

        {/* Step 2: Version */}
        {step === "version" && (
          <Animated.View entering={FadeIn.duration(200)} style={{ flex: 1 }}>
            {/* Selected Artwork Preview */}
            <View style={{ alignItems: "center", marginBottom: spacing.lg }}>
              <Image
                source={{ uri: artworks?.[selectedArtworkIndex]?.imageUrlSmall ?? card.imageUrl }}
                style={{ width: 120, height: 168, borderRadius: 10 }}
                contentFit="contain"
                placeholder={{ blurhash: "L03u%Vt700WB~qj[j[j[00WB~qof" }}
                transition={200}
              />
            </View>

            {/* Version List */}
            <View style={{ flex: 1, paddingHorizontal: spacing.lg }}>
              <Text style={{
                fontFamily: fontFamily.semibold, fontSize: fontSize.sm,
                color: colors.text.muted, marginBottom: spacing.sm,
              }}>
                {t("variant.setVersions")} ({versions.length})
              </Text>
              <ScrollView showsVerticalScrollIndicator={false}>
                {versions.map((version, index) => {
                  const isSelected = selectedVersionIndex === index;
                  return (
                    <Pressable
                      key={`${version.setCode}-${index}`}
                      testID={`variant-version-${index}`}
                      onPress={() => setSelectedVersionIndex(index)}
                      accessibilityState={{ selected: isSelected }}
                      accessibilityLabel={`${version.setCode} ${version.setName}`}
                      style={{
                        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                        paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
                        borderRadius: 10, marginBottom: spacing.xs,
                        backgroundColor: isSelected ? colors.primary.muted : "transparent",
                        borderWidth: 1,
                        borderColor: isSelected ? colors.primary.DEFAULT : "transparent",
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                          <Text style={{
                            fontFamily: fontFamily.semibold, fontSize: fontSize.xs,
                            color: colors.primary.light,
                          }}>
                            [{version.setCode}]
                          </Text>
                          <Text style={{
                            fontFamily: fontFamily.regular, fontSize: fontSize.xs,
                            color: colors.text.secondary, flex: 1,
                          }} numberOfLines={1}>
                            {version.setName}
                          </Text>
                        </View>
                        {version.rarity ? (
                          <Text style={{
                            fontFamily: fontFamily.regular, fontSize: fontSize.xs,
                            color: colors.text.muted, marginTop: 1,
                          }}>
                            {version.rarity}
                          </Text>
                        ) : null}
                      </View>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                        <Text style={{
                          fontFamily: fontFamily.bold, fontSize: fontSize.sm,
                          color: version.price ? colors.success.DEFAULT : colors.text.muted,
                        }}>
                          {version.price ? `$${version.price.toFixed(2)}` : "\u2014"}
                        </Text>
                        <View style={{
                          width: 18, height: 18, borderRadius: 9, borderWidth: 2,
                          borderColor: isSelected ? colors.primary.DEFAULT : colors.surface.border,
                          alignItems: "center", justifyContent: "center",
                        }}>
                          {isSelected && (
                            <View style={{
                              width: 10, height: 10, borderRadius: 5,
                              backgroundColor: colors.primary.DEFAULT,
                            }} />
                          )}
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Add Button */}
            <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, paddingTop: spacing.sm }}>
              <Pressable
                testID="variant-add-btn"
                onPress={handleAdd}
                accessibilityLabel={t("variant.addCard")}
                style={{
                  alignItems: "center", paddingVertical: spacing.lg,
                  borderRadius: 12, backgroundColor: colors.primary.DEFAULT,
                }}
              >
                <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.base, color: colors.text.primary }}>
                  {t("variant.addCard")}
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        )}
      </View>
    </Modal>
  );
}
