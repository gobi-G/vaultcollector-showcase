import { Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui";
import { colors, fontFamily, fontSize, spacing } from "@/constants/theme";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const appIcon = require("../../../assets/icon.png") as number;

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing["2xl"] }}>
        <Image
          source={appIcon}
          style={{ width: 120, height: 120, borderRadius: 24, marginBottom: spacing.lg }}
        />
        <Text
          style={{
            fontFamily: fontFamily.extrabold,
            fontSize: fontSize["4xl"],
            color: colors.text.primary,
            marginBottom: spacing.xs,
          }}
        >
          {t("common.appName")}
        </Text>
        <Text
          style={{
            fontFamily: fontFamily.regular,
            fontSize: fontSize.lg,
            color: colors.text.muted,
            marginBottom: spacing["5xl"],
          }}
        >
          {t("auth.tagline")}
        </Text>
        <View style={{ width: "100%", gap: spacing.md }}>
          {/* TODO: Apple + Google Sign-In — uncomment when configured
          <Button
            testID="welcome-apple-btn"
            label={t("auth.continueWithApple")}
            variant="outline"
            size="lg"
            style={{ width: "100%" }}
            accessibilityLabel={t("auth.continueWithApple")}
          />
          <Button
            testID="welcome-google-btn"
            label={t("auth.continueWithGoogle")}
            variant="outline"
            size="lg"
            style={{ width: "100%" }}
            accessibilityLabel={t("auth.continueWithGoogle")}
          />
          */}
          <Button
            testID="welcome-email-btn"
            label={t("auth.continueWithEmail")}
            variant="primary"
            size="lg"
            onPress={() => router.push("/(auth)/email")}
            style={{ width: "100%" }}
            accessibilityLabel={t("auth.continueWithEmail")}
          />
        </View>
        <Text
          style={{
            fontFamily: fontFamily.regular,
            fontSize: fontSize.xs,
            color: colors.text.muted,
            textAlign: "center",
            marginTop: spacing["2xl"],
            paddingHorizontal: spacing.lg,
          }}
        >
          {t("auth.termsNotice")}
        </Text>
      </View>
    </SafeAreaView>
  );
}
