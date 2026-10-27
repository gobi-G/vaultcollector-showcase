import { useMemo } from "react";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { LineChart } from "react-native-gifted-charts";
import { GlassCard } from "@/components/ui";
import { PriceChange } from "@/components/features/PriceChange";
import { formatCurrency, formatCurrencyCompact } from "@/utils/FormatCurrency";
import { colors } from "@/constants/theme";
import { usePortfolioHistory } from "@/hooks/queries";

type PortfolioCardProps = {
  totalValue: number;
  changeValue: number;
  changePercentage: number;
  itemCount: number;
  hasReturn?: boolean;
  className?: string;
};

// Fallback chart data when no history is available
const MOCK_CHART_DATA = [
  { value: 0 },
  { value: 120 },
  { value: 180 },
  { value: 150 },
  { value: 220 },
  { value: 200 },
  { value: 280 },
  { value: 350 },
];

export function PortfolioCard({
  totalValue,
  changeValue,
  changePercentage,
  itemCount,
  hasReturn = true,
  className = "",
}: PortfolioCardProps) {
  const { t } = useTranslation();
  const isPositive = changePercentage >= 0;
  const { data: portfolioHistory } = usePortfolioHistory();

  const chartData = useMemo(() => {
    if (!portfolioHistory || portfolioHistory.length === 0) {
      return null;
    }
    return portfolioHistory.map((point) => ({ value: point.value }));
  }, [portfolioHistory]);

  const hasRealData = chartData !== null && chartData.length > 0;
  const displayData = hasRealData ? chartData : MOCK_CHART_DATA;

  return (
    <GlassCard elevated className={className}>
      <Text className="font-sans-medium text-sm text-text-secondary">
        {t("portfolio.totalValue")}
      </Text>
      <Text className="mt-xs font-sans-extrabold text-4xl text-text-primary">
        {formatCurrency(totalValue)}
      </Text>
      {hasReturn ? (
        <PriceChange value={changeValue} percentage={changePercentage} className="mt-sm" />
      ) : null}

      {/* Chart */}
      {totalValue > 0 && (
        <View style={{ marginTop: 16, marginHorizontal: -8 }}>
          {!hasRealData && (
            <Text className="mb-xs font-sans text-xs text-text-muted">
              {t("portfolio.noHistory")}
            </Text>
          )}
          <LineChart
            data={displayData}
            width={280}
            height={140}
            spacing={hasRealData ? Math.max(10, 280 / displayData.length) : 40}
            hideDataPoints
            yAxisTextStyle={{ color: colors.text.muted, fontSize: 9, fontFamily: "PlusJakartaSans-Regular" }}
            yAxisColor="transparent"
            xAxisColor="transparent"
            rulesColor={colors.surface.border}
            rulesType="dashed"
            noOfSections={3}
            color={isPositive ? colors.success.DEFAULT : colors.danger.DEFAULT}
            startFillColor={isPositive ? colors.success.DEFAULT : colors.danger.DEFAULT}
            endFillColor="transparent"
            startOpacity={0.2}
            endOpacity={0}
            areaChart
            curved
            thickness={2}
          />
          {hasRealData && (
            <Text style={{ color: colors.text.muted, fontSize: 10, fontFamily: "PlusJakartaSans-Regular", textAlign: "right", marginTop: 4 }}>
              {t("portfolio.lastDays", { count: displayData.length })}
            </Text>
          )}
        </View>
      )}

      <View className="mt-lg flex-row items-center justify-between border-t border-surface-border pt-lg">
        <View>
          <Text className="font-sans text-xs text-text-muted">{t("portfolio.items")}</Text>
          <Text className="font-sans-bold text-lg text-text-primary">{itemCount}</Text>
        </View>
        <View>
          <Text className="font-sans text-xs text-text-muted">{t("portfolio.avgPerItem")}</Text>
          <Text className="font-sans-bold text-lg text-text-primary">
            {itemCount > 0 ? formatCurrencyCompact(totalValue / itemCount) : formatCurrency(0, 0)}
          </Text>
        </View>
        <View>
          <Text className="font-sans text-xs text-text-muted">{t("portfolio.return")}</Text>
          <Text className={`font-sans-bold text-lg ${hasReturn ? (isPositive ? "text-success" : "text-danger") : "text-text-muted"}`}>
            {hasReturn ? `${isPositive ? "+" : ""}${changePercentage.toFixed(1)}%` : "—"}
          </Text>
        </View>
      </View>
    </GlassCard>
  );
}
