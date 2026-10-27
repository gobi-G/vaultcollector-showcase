import { Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import { WifiOff } from "lucide-react-native";
import { useNetwork } from "@/hooks/useNetwork";
import { colors, fontFamily, fontSize, spacing } from "@/constants/theme";

export function OfflineBanner() {
  const { t } = useTranslation();
  const { isOnline } = useNetwork();
  const insets = useSafeAreaInsets();

  if (isOnline) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      exiting={FadeOutUp.duration(300)}
      style={{
        position: "absolute",
        top: insets.top,
        left: 0,
        right: 0,
        zIndex: 999,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.sm,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.lg,
        backgroundColor: colors.warning.muted,
      }}
    >
      <WifiOff size={12} color={colors.warning.DEFAULT} />
      <Text style={{
        fontFamily: fontFamily.semibold,
        fontSize: fontSize.xs,
        color: colors.warning.DEFAULT,
      }}>
        {t("offline.banner")}
      </Text>
    </Animated.View>
  );
}
