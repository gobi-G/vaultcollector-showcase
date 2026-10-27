import { Pressable, ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react-native";
import { BarChart } from "react-native-gifted-charts";
import { GlassCard } from "@/components/ui";
import { VaultLocationCard } from "@/components/features/VaultLocationCard";
import { colors, fontFamily, fontSize, spacing } from "@/constants/theme";
import type { Location } from "@vault-collector/shared";

type LocationStat = { count: number; value: number };

type VaultRootViewProps = {
  locations: Location[] | undefined;
  locationStats: Record<string, LocationStat>;
  chartData: { value: number; label: string; frontColor: string; topLabelComponent: () => React.ReactNode }[];
  totalVaultValue: number;
  onNavigateInto: (location: Location) => void;
  onShowCreate: () => void;
};

export function VaultRootView({
  locations,
  locationStats,
  chartData,
  totalVaultValue,
  onNavigateInto,
  onShowCreate,
}: VaultRootViewProps) {
  const { t } = useTranslation();

  return (
    <>
      {/* Total Value */}
      <GlassCard elevated className="mx-lg mt-md">
        <Text style={{ fontFamily: fontFamily.regular, fontSize: fontSize.sm, color: colors.text.muted }}>
          {t("vault.totalValue")}
        </Text>
        <Text style={{ fontFamily: fontFamily.bold, fontSize: fontSize["3xl"], color: colors.text.primary, marginTop: spacing.xs }}>
          ${totalVaultValue.toLocaleString()}
        </Text>
      </GlassCard>

      {/* Location Cards */}
      {locations && locations.length > 0 && (
        <View style={{ marginTop: spacing.xl }}>
          <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.lg, color: colors.text.primary, paddingHorizontal: spacing.lg, marginBottom: spacing.md }}>
            {t("vault.yourLocations")}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing.lg }}
          >
            {locations.map((loc) => (
              <VaultLocationCard
                key={loc.id}
                testID={`vault-location-${loc.id}`}
                name={loc.name}
                icon={loc.icon}
                itemCount={locationStats[loc.id]?.count ?? 0}
                totalValue={locationStats[loc.id]?.value ?? 0}
                isPositive
                onPress={() => onNavigateInto(loc)}
              />
            ))}

            <Pressable
              testID="vault-add-card"
              onPress={onShowCreate}
              style={{
                width: 160,
                padding: spacing.lg,
                borderRadius: 20,
                borderWidth: 2,
                borderStyle: "dashed",
                borderColor: colors.surface.border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Plus size={32} color={colors.text.muted} />
              <Text style={{ fontFamily: fontFamily.medium, fontSize: fontSize.sm, color: colors.text.muted, marginTop: spacing.sm }}>
                {t("vault.addLocation")}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      )}

      {/* Value Breakdown Chart */}
      {chartData.length > 0 && (
        <View style={{ marginTop: spacing.xl, paddingHorizontal: spacing.lg }}>
          <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.lg, color: colors.text.primary, marginBottom: spacing.md }}>
            {t("vault.valueBreakdown")}
          </Text>
          <GlassCard>
            <BarChart
              data={chartData}
              barWidth={40}
              noOfSections={4}
              barBorderRadius={6}
              frontColor={colors.primary.DEFAULT}
              yAxisColor="transparent"
              xAxisColor={colors.surface.border}
              yAxisTextStyle={{ fontFamily: fontFamily.regular, fontSize: 10, color: colors.text.muted }}
              xAxisLabelTextStyle={{ fontFamily: fontFamily.regular, fontSize: 10, color: colors.text.muted }}
              hideRules
              height={120}
              spacing={30}
            />
          </GlassCard>
        </View>
      )}

      {/* Empty State */}
      {(!locations || locations.length === 0) && (
        <View style={{ alignItems: "center", marginTop: spacing["5xl"], paddingHorizontal: spacing.xl }}>
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: colors.primary.muted,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: spacing.lg,
          }}>
            <Text style={{ fontSize: 36 }}>🔒</Text>
          </View>
          <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.lg, color: colors.text.primary, marginBottom: spacing.xs }}>
            {t("vault.empty")}
          </Text>
          <Text style={{ fontFamily: fontFamily.regular, fontSize: fontSize.sm, color: colors.text.muted, textAlign: "center" }}>
            {t("vault.emptyHint")}
          </Text>
          <Pressable
            testID="vault-empty-add-btn"
            onPress={onShowCreate}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.sm,
              marginTop: spacing.xl,
              paddingHorizontal: spacing.xl,
              paddingVertical: spacing.md,
              borderRadius: 12,
              backgroundColor: colors.primary.DEFAULT,
            }}
          >
            <Plus size={18} color={colors.text.primary} />
            <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.base, color: colors.text.primary }}>
              {t("vault.addLocation")}
            </Text>
          </Pressable>
        </View>
      )}
    </>
  );
}
