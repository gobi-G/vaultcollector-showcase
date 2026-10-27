import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronUp, Info, Star, X } from "lucide-react-native";
import type { CardSearchResult } from "@vault-collector/shared";
import { Button, GlassCard } from "@/components/ui";
import { ConfidenceChecklist } from "@/components/features/ConfidenceChecklist";
import { colors, fontFamily, fontSize, spacing } from "@/constants/theme";

const TCG_COLORS: Record<string, string> = {
  pokemon: "#E3350D",
  yugioh: "#7B2D8B",
  magic: "#F0A500",
};

const TCG_LABELS: Record<string, string> = {
  pokemon: "Pokémon",
  yugioh: "Yu-Gi-Oh!",
  magic: "Magic: The Gathering",
};

function tcgColor(type: string): string {
  return TCG_COLORS[type] ?? colors.primary.DEFAULT;
}

function tcgLabel(type: string): string {
  return TCG_LABELS[type] ?? type;
}

type ScanResultData = {
  name: string;
  tcgType: "pokemon" | "yugioh" | "magic";
  set: string;
  number: string;
  rarity: string;
  estimatedCondition: string;
  confidence: number;
  checks: { name: boolean; number: boolean; set: boolean; image: boolean } | null;
  imageUrl?: string;
  price?: number | null;
  passcode?: string | null;
  edition?: string | null;
  variant?: string | null;
};

type ScanResultViewProps = {
  scanResult: ScanResultData;
  alternativeCards?: CardSearchResult[];
  onReset: () => void;
  onAddToCollection: () => void;
  onSelectAlternative?: (card: CardSearchResult) => void;
  children?: React.ReactNode;
};

export function ScanResultView({
  scanResult,
  alternativeCards,
  onReset,
  onAddToCollection,
  onSelectAlternative,
  children,
}: ScanResultViewProps) {
  const { t } = useTranslation();
  const [showAlternatives, setShowAlternatives] = useState(false);
  const alternatives = (alternativeCards ?? []).filter(
    (c) => c.cardApiId !== scanResult.imageUrl // exclude current
  );

  return (
    <SafeAreaView
      testID="scan-result"
      style={{ flex: 1, backgroundColor: colors.background.primary }}
    >
      {/* Fixed Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm }}>
        <Text
          style={{
            fontFamily: fontFamily.bold,
            fontSize: fontSize["2xl"],
            color: colors.text.primary,
          }}
        >
          {t("scan.resultTitle")}
        </Text>
        <Pressable
          testID="scan-reset-btn"
          onPress={onReset}
          accessibilityLabel={t("scan.scanAgain")}
        >
          <X size={24} color={colors.text.muted} />
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: spacing.lg }} contentContainerStyle={{ paddingBottom: 160 }}>

        {/* Card Image from API */}
        {scanResult.imageUrl ? (
          <Image
            source={{ uri: scanResult.imageUrl }}
            style={{
              width: "100%",
              height: 300,
              borderRadius: 16,
              marginBottom: spacing.lg,
              backgroundColor: colors.background.tertiary,
            }}
            contentFit="contain"
            placeholder={{ blurhash: "L03u%Vt700WB~qj[j[j[00WB~qof" }}
            transition={200}
          />
        ) : null}

        {/* Result Card */}
        <GlassCard>
          <ConfidenceChecklist
            confidence={scanResult.confidence}
            checks={scanResult.checks}
          />

          <Text
            style={{
              fontFamily: fontFamily.bold,
              fontSize: fontSize.xl,
              color: colors.text.primary,
              marginBottom: spacing.xs,
            }}
          >
            {scanResult.name}
          </Text>
          {/* TCG Type Badge */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm }}>
            <View
              style={{
                backgroundColor: tcgColor(scanResult.tcgType),
                paddingHorizontal: spacing.sm,
                paddingVertical: 2,
                borderRadius: 6,
              }}
            >
              <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.xs, color: "#fff" }}>
                {tcgLabel(scanResult.tcgType)}
              </Text>
            </View>
            {scanResult.rarity && scanResult.rarity.length > 0 ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  backgroundColor: "rgba(255,255,255,0.08)",
                  paddingHorizontal: spacing.sm,
                  paddingVertical: 2,
                  borderRadius: 6,
                }}
              >
                <Star size={12} color={colors.warning.DEFAULT} />
                <Text style={{ fontFamily: fontFamily.medium, fontSize: fontSize.xs, color: colors.text.secondary }}>
                  {scanResult.rarity}
                </Text>
              </View>
            ) : null}
          </View>

          <Text
            style={{
              fontFamily: fontFamily.regular,
              fontSize: fontSize.base,
              color: colors.text.muted,
              marginBottom: spacing.xs,
            }}
          >
            {scanResult.set}{scanResult.number ? ` · ${scanResult.number}` : ""}
          </Text>

          {/* Passcode + Edition + Variant */}
          {(scanResult.passcode || scanResult.edition || scanResult.variant) ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.xs }}>
              {scanResult.passcode ? (
                <Text style={{ fontFamily: fontFamily.regular, fontSize: fontSize.xs, color: colors.text.muted }}>
                  #{scanResult.passcode}
                </Text>
              ) : null}
              {scanResult.edition ? (
                <View style={{ backgroundColor: "rgba(212,175,55,0.2)", paddingHorizontal: spacing.xs, paddingVertical: 1, borderRadius: 4 }}>
                  <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.xs, color: "#D4AF37" }}>
                    {scanResult.edition}
                  </Text>
                </View>
              ) : null}
              {scanResult.variant ? (
                <View style={{ backgroundColor: "rgba(99,102,241,0.15)", paddingHorizontal: spacing.xs, paddingVertical: 1, borderRadius: 4 }}>
                  <Text style={{ fontFamily: fontFamily.medium, fontSize: fontSize.xs, color: "#818CF8" }}>
                    {scanResult.variant}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {/* Price */}
          {scanResult.price ? (
            <Text
              style={{
                fontFamily: fontFamily.extrabold,
                fontSize: fontSize["3xl"],
                color: colors.success.DEFAULT,
                marginTop: spacing.md,
                marginBottom: spacing.xs,
              }}
            >
              ${scanResult.price.toFixed(2)}
            </Text>
          ) : null}

          <Text
            style={{
              fontFamily: fontFamily.regular,
              fontSize: fontSize.sm,
              color: colors.text.secondary,
            }}
          >
            {t("scan.estimatedCondition")}: {t(`condition.${scanResult.estimatedCondition}`)}
          </Text>
        </GlassCard>

        {/* Market Disclaimer */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.md, paddingHorizontal: spacing.sm }}>
          <Info size={14} color={colors.text.muted} />
          <Text style={{ fontFamily: fontFamily.regular, fontSize: fontSize.xs, color: colors.text.muted, flex: 1 }}>
            {t("scan.marketDisclaimer")}
          </Text>
        </View>

        {/* Wrong card? Show alternatives */}
        {alternatives.length > 0 && onSelectAlternative ? (
          <View style={{ marginTop: spacing.lg }}>
            <Pressable
              onPress={() => setShowAlternatives(!showAlternatives)}
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xs, paddingVertical: spacing.sm }}
            >
              <Text style={{ fontFamily: fontFamily.medium, fontSize: fontSize.sm, color: colors.primary.light }}>
                {t("scan.wrongCard")}
              </Text>
              {showAlternatives ? (
                <ChevronUp size={16} color={colors.primary.light} />
              ) : (
                <ChevronDown size={16} color={colors.primary.light} />
              )}
            </Pressable>

            {showAlternatives ? (
              <View style={{ gap: spacing.xs }}>
                {alternatives.map((alt, i) => (
                  <Pressable
                    key={`${alt.cardApiId}-${i}`}
                    onPress={() => onSelectAlternative(alt)}
                    style={{
                      flexDirection: "row", alignItems: "center", gap: spacing.sm,
                      paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
                      borderRadius: 8, backgroundColor: colors.surface.default,
                    }}
                  >
                    <Image
                      source={{ uri: alt.imageUrl }}
                      style={{ width: 32, height: 44, borderRadius: 4 }}
                      contentFit="contain"
                      placeholder={{ blurhash: "L03u%Vt700WB~qj[j[j[00WB~qof" }}
                      transition={200}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: fontFamily.medium, fontSize: fontSize.sm, color: colors.text.primary }} numberOfLines={1}>
                        {alt.setName}
                      </Text>
                      {alt.setCode ? (
                        <Text style={{ fontFamily: fontFamily.regular, fontSize: fontSize.xs, color: colors.primary.light }}>
                          [{alt.setCode}] #{alt.cardNumber}
                        </Text>
                      ) : null}
                    </View>
                    <Text style={{ fontFamily: fontFamily.bold, fontSize: fontSize.sm, color: alt.price ? colors.success.DEFAULT : colors.text.muted }}>
                      {alt.price ? `$${alt.price.toFixed(2)}` : "\u2014"}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Actions */}
        <View style={{ gap: spacing.md, paddingTop: spacing.xl }}>
          <Button
            testID="scan-add-btn"
            label={t("scan.addToCollection")}
            variant="primary"
            size="lg"
            onPress={onAddToCollection}
          />
          <Button
            testID="scan-again-btn"
            label={t("scan.scanAgain")}
            variant="secondary"
            size="lg"
            onPress={onReset}
          />
        </View>

        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
