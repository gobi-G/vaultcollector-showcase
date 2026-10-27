import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ChevronLeft } from "lucide-react-native";
import { colors, fontFamily, fontSize, spacing } from "@/constants/theme";
import { LEGAL_DOCS, type LegalDocType } from "@/constants/legalDocs";

export default function LegalDocScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: LegalDocType }>();

  const docEntry = type ? LEGAL_DOCS[type] : undefined;
  const lang = i18n.language === "de" ? "de" : "en";
  const doc = docEntry?.[lang];

  if (!doc) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
        <Text style={{ color: colors.text.primary, padding: spacing.lg }}>
          {t("common.error")}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }} edges={["top"]}>
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        gap: spacing.sm,
      }}>
        <Pressable
          testID="legal-back-btn"
          onPress={() => router.back()}
          accessibilityLabel={t("common.back")}
          style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}
        >
          <ChevronLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={{
          fontFamily: fontFamily.bold,
          fontSize: fontSize.xl,
          color: colors.text.primary,
          flex: 1,
        }}>
          {t(`legal.${type}`)}
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1, paddingHorizontal: spacing.lg }}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Text style={{
          fontFamily: fontFamily.regular,
          fontSize: fontSize.sm,
          color: colors.text.secondary,
          lineHeight: 22,
        }}>
          {doc}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
