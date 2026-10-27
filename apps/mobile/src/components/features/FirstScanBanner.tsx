import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { ChevronRight, ScanLine } from "lucide-react-native";
import { GlassCard } from "@/components/ui";
import { colors } from "@/constants/theme";

type FirstScanBannerProps = {
  onPress: () => void;
};

export function FirstScanBanner({ onPress }: FirstScanBannerProps) {
  const { t } = useTranslation();

  return (
    <Pressable onPress={onPress} testID="first-scan-banner" accessibilityLabel={t("firstRun.bannerTitle")} accessibilityRole="button">
      <GlassCard elevated className="mt-xl flex-row items-center gap-lg">
        <View className="h-[56px] w-[56px] items-center justify-center rounded-2xl bg-primary-muted">
          <ScanLine size={28} color={colors.primary.light} />
        </View>
        <View className="flex-1">
          <Text className="font-sans-bold text-lg text-text-primary">
            {t("firstRun.bannerTitle")}
          </Text>
          <Text className="mt-xs font-sans text-sm text-text-muted">
            {t("firstRun.bannerSubtitle")}
          </Text>
        </View>
        <ChevronRight size={20} color={colors.text.muted} />
      </GlassCard>
    </Pressable>
  );
}
