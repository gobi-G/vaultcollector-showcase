import { Text, View } from "react-native";

type PriceChangeProps = {
  value: number;
  percentage: number;
  className?: string;
};

export function PriceChange({ value, percentage, className = "" }: PriceChangeProps) {
  const isPositive = percentage >= 0;
  const arrow = isPositive ? "\u25B2" : "\u25BC";
  const colorClass = isPositive ? "text-success" : "text-danger";
  const bgClass = isPositive ? "bg-success-muted" : "bg-danger-muted";

  return (
    <View className={`flex-row items-center gap-sm ${className}`}>
      <View className={`rounded-full px-sm py-xs ${bgClass}`}>
        <Text className={`font-sans-semibold text-xs ${colorClass}`}>
          {arrow} {Math.abs(percentage).toFixed(2)}%
        </Text>
      </View>
      <Text className={`font-sans text-sm ${colorClass}`}>
        {isPositive ? "+" : "-"}${Math.abs(value).toLocaleString()}
      </Text>
    </View>
  );
}
