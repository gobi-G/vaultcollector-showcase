import { useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";
import { ScanLine } from "lucide-react-native";
import { colors, fontFamily, fontSize, spacing } from "@/constants/theme";

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const handleGetStarted = useCallback(async () => {
    await AsyncStorage.setItem("hasSeenOnboarding", "true");
    router.replace("/(auth)/welcome");
  }, [router]);

  return (
    <SafeAreaView testID="onboarding-screen" className="flex-1 bg-bg-primary">
      {/* Content */}
      <View className="flex-1 items-center justify-center px-3xl">
        {/* Icon */}
        <Animated.View
          entering={FadeIn.duration(600)}
          style={{
            width: 140,
            height: 140,
            borderRadius: 70,
            backgroundColor: `${colors.primary.DEFAULT}15`,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: spacing["3xl"],
          }}
        >
          <Animated.View
            entering={FadeInDown.delay(200).duration(500).springify()}
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: `${colors.primary.DEFAULT}25`,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ScanLine size={48} color={colors.primary.light} />
          </Animated.View>
        </Animated.View>

        {/* Title */}
        <Animated.Text
          entering={FadeInUp.delay(300).duration(500)}
          style={{
            fontFamily: fontFamily.bold,
            fontSize: fontSize["3xl"],
            color: colors.text.primary,
            textAlign: "center",
            marginBottom: spacing.md,
          }}
        >
          {t("onboarding.scanTitle")}
        </Animated.Text>

        {/* Description */}
        <Animated.Text
          entering={FadeInUp.delay(400).duration(500)}
          style={{
            fontFamily: fontFamily.regular,
            fontSize: fontSize.base,
            color: colors.text.muted,
            textAlign: "center",
            lineHeight: 24,
            paddingHorizontal: spacing.lg,
          }}
        >
          {t("onboarding.scanDescription")}
        </Animated.Text>
      </View>

      {/* Button */}
      <Animated.View
        entering={FadeInUp.delay(500).duration(600)}
        style={{ paddingHorizontal: spacing.xl, paddingBottom: spacing["3xl"] }}
      >
        <Pressable
          testID="onboarding-get-started"
          onPress={handleGetStarted}
          className="items-center rounded-2xl bg-primary py-lg"
        >
          <Text className="font-sans-bold text-lg text-text-primary">
            {t("onboarding.getStarted")}
          </Text>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}
