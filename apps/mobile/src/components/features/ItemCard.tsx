import { Text, View } from "react-native";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { Badge, GlassCard } from "@/components/ui";

type ItemCondition = "mint" | "near_mint" | "played" | "damaged";

type ItemCardProps = {
  name: string;
  setName: string;
  imageUrl: string;
  price: number;
  priceChange: number;
  condition: ItemCondition;
  location: string;
  className?: string;
};

const conditionVariant: Record<
  ItemCondition,
  "success" | "primary" | "warning" | "danger"
> = {
  mint: "success",
  near_mint: "primary",
  played: "warning",
  damaged: "danger",
};

const conditionI18nKey: Record<ItemCondition, string> = {
  mint: "condition.mint",
  near_mint: "condition.nearMint",
  played: "condition.played",
  damaged: "condition.damaged",
};

export function ItemCard({
  name,
  setName,
  imageUrl,
  price,
  priceChange,
  condition,
  location,
  className = "",
}: ItemCardProps) {
  const { t } = useTranslation();
  const isPositive = priceChange >= 0;

  return (
    <GlassCard className={`flex-row gap-lg ${className}`}>
      <View className="h-[100px] w-[72px] overflow-hidden rounded-md bg-bg-tertiary">
        <Image
          source={{ uri: imageUrl }}
          className="h-full w-full"
          contentFit="cover"
          placeholder={{ blurhash: "L03u%Vt700WB~qj[j[j[00WB~qof" }}
          transition={200}
          accessibilityLabel={name}
        />
      </View>
      <View className="flex-1 justify-between">
        <View>
          <Text className="font-sans-bold text-base text-text-primary" numberOfLines={1}>
            {name}
          </Text>
          <Text className="font-sans text-xs text-text-muted">{setName}</Text>
        </View>
        <View className="flex-row items-center gap-xs">
          <Badge label={t(conditionI18nKey[condition])} variant={conditionVariant[condition]} />
          <Text className="font-sans text-xs text-text-muted" numberOfLines={1}>
            {location}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="font-sans-bold text-lg text-text-primary">
            ${price.toLocaleString()}
          </Text>
          <Text
            className={`font-sans-semibold text-sm ${
              isPositive ? "text-success" : "text-danger"
            }`}
          >
            {isPositive ? "+" : ""}
            {priceChange.toFixed(1)}%
          </Text>
        </View>
      </View>
    </GlassCard>
  );
}
