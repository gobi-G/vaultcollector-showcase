import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Image } from "expo-image";
import { CheckCircle } from "lucide-react-native";
import { Button, GlassCard } from "@/components/ui";
import { colors } from "@/constants/theme";

type FirstScanSuccessViewProps = {
  cardName: string;
  imageUrl: string | undefined;
  marketPrice: number | null;
  portfolioValue: number;
  onScanMore: () => void;
  onViewPortfolio: () => void;
};

export function FirstScanSuccessView({
  cardName,
  imageUrl,
  marketPrice,
  portfolioValue,
  onScanMore,
  onViewPortfolio,
}: FirstScanSuccessViewProps) {
  const { t } = useTranslation();
  const formatPrice = (price: number | null) =>
    price != null ? `$${price.toFixed(2)}` : "\u2014";

  return (
    <SafeAreaView testID="first-scan-success" className="flex-1 bg-bg-primary">
      <View className="flex-1 items-center justify-center px-2xl">
        {/* Success Icon */}
        <View className="mb-lg items-center">
          <View className="h-[64px] w-[64px] items-center justify-center rounded-full bg-success-muted">
            <CheckCircle size={32} color={colors.success.DEFAULT} />
          </View>
        </View>

        {/* Title */}
        <Text className="mb-2xl font-sans-bold text-2xl text-text-primary">
          {t("firstRun.successTitle")}
        </Text>

        {/* Card Image */}
        {imageUrl && (
          <View className="mb-xl items-center">
            <Image
              source={{ uri: imageUrl }}
              style={{ width: 180, height: 252, borderRadius: 12 }}
              contentFit="contain"
              placeholder={{ blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4" }}
              transition={300}
            />
          </View>
        )}

        {/* Card Name */}
        <Text className="mb-sm font-sans-semibold text-xl text-text-primary">
          {cardName}
        </Text>

        {/* Market Price */}
        <Text className="mb-2xl font-sans text-base text-text-secondary">
          {formatPrice(marketPrice)}
        </Text>

        {/* Portfolio Value */}
        <GlassCard elevated className="mb-3xl w-full items-center">
          <Text className="font-sans-medium text-sm text-text-secondary">
            {t("firstRun.portfolioLabel")}
          </Text>
          <Text className="mt-xs font-sans-extrabold text-3xl text-success-light">
            {formatPrice(portfolioValue)}
          </Text>
        </GlassCard>

        {/* CTAs */}
        <View className="w-full gap-md">
          <Button testID="first-scan-success-scan-more" label={t("firstRun.scanMore")} variant="primary" size="lg" onPress={onScanMore} />
          <Button testID="first-scan-success-view-portfolio" label={t("firstRun.viewPortfolio")} variant="ghost" size="lg" onPress={onViewPortfolio} />
        </View>
      </View>
    </SafeAreaView>
  );
}
