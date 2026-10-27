import { Pressable, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react-native";
import type { CardSearchResult } from "@vault-collector/shared";
import { Button, GlassCard } from "@/components/ui";
import { colors } from "@/constants/theme";

type ScanSuggestionViewProps = {
  suggestions: CardSearchResult[];
  scanResult: { name: string; tcgType: string; confidence: number };
  onSelectCard: (card: CardSearchResult) => void;
  onNoneMatch: () => void;
  onReset: () => void;
};

export function ScanSuggestionView({
  suggestions,
  scanResult,
  onSelectCard,
  onNoneMatch,
  onReset,
}: ScanSuggestionViewProps) {
  const { t } = useTranslation();
  const confidencePercent = Math.round(scanResult.confidence * 100);

  return (
    <SafeAreaView
      testID="scan-suggestion-view"
      className="flex-1 bg-bg-primary"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-lg pb-sm pt-md">
        <View className="flex-1 pr-md">
          <Text className="font-sans-bold text-2xl text-text-primary">
            {t("scan.suggestionTitle")}
          </Text>
          <Text className="mt-xs font-sans text-sm text-text-muted">
            {scanResult.name} ({confidencePercent}%)
          </Text>
        </View>
        <Pressable
          testID="scan-suggestion-close-btn"
          onPress={onReset}
          accessibilityLabel={t("scan.scanAgain")}
          className="h-[44px] w-[44px] items-center justify-center"
        >
          <X size={24} color={colors.text.muted} />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1 px-lg"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Suggestion Cards */}
        <View className="gap-md pt-md">
          {suggestions.slice(0, 3).map((card, index) => (
            <Pressable
              key={`${card.cardApiId}-${index}`}
              testID={`scan-suggestion-card-${index}`}
              onPress={() => onSelectCard(card)}
              accessibilityLabel={`${card.name} - ${card.setName}`}
            >
              <GlassCard elevated>
                <View className="flex-row gap-md">
                  <Image
                    source={{ uri: card.imageUrl }}
                    style={{
                      width: 80,
                      height: 112,
                      borderRadius: 8,
                      backgroundColor: colors.background.tertiary,
                    }}
                    contentFit="contain"
                    placeholder={{ blurhash: "L03u%Vt700WB~qj[j[j[00WB~qof" }}
                    transition={200}
                  />
                  <View className="flex-1 justify-center">
                    <Text
                      className="font-sans-semibold text-base text-text-primary"
                      numberOfLines={2}
                    >
                      {card.name}
                    </Text>
                    <Text
                      className="mt-xs font-sans text-sm text-text-secondary"
                      numberOfLines={1}
                    >
                      {card.setName}
                    </Text>
                    {card.price ? (
                      <Text className="mt-sm font-sans-bold text-lg text-success">
                        ${card.price.toFixed(2)}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </GlassCard>
            </Pressable>
          ))}
        </View>

        {/* None of these button */}
        <View className="mt-xl">
          <Button
            testID="scan-suggestion-none-btn"
            label={t("scan.suggestionNoneMatch")}
            variant="outline"
            size="lg"
            className="w-full"
            onPress={onNoneMatch}
            accessibilityLabel={t("scan.suggestionNoneMatch")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
