import { Text, View } from "react-native";

type AssetRowProps = {
  icon: string;
  label: string;
  sublabel: string;
  value: string;
  change?: string;
  changePositive?: boolean;
  className?: string;
};

export function AssetRow({
  icon,
  label,
  sublabel,
  value,
  change,
  changePositive = true,
  className = "",
}: AssetRowProps) {
  return (
    <View className={`flex-row items-center justify-between py-md ${className}`}>
      <View className="flex-row items-center gap-md">
        <View className="h-[40px] w-[40px] items-center justify-center rounded-full bg-surface-glass">
          <Text className="text-lg">{icon}</Text>
        </View>
        <View>
          <Text className="font-sans-semibold text-base text-text-primary">{label}</Text>
          <Text className="font-sans text-xs text-text-muted">{sublabel}</Text>
        </View>
      </View>
      <View className="items-end">
        <Text className="font-sans-bold text-base text-text-primary">{value}</Text>
        {change && (
          <Text
            className={`font-sans text-xs ${
              changePositive ? "text-success" : "text-danger"
            }`}
          >
            {change}
          </Text>
        )}
      </View>
    </View>
  );
}
