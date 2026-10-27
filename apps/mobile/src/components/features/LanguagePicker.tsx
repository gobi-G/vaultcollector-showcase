import { Modal, Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Check, Globe, X } from "lucide-react-native";
import { colors, fontFamily, fontSize, spacing } from "@/constants/theme";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
] as const;

type LanguagePickerProps = {
  visible: boolean;
  onClose: () => void;
};

export function LanguagePicker({ visible, onClose }: LanguagePickerProps) {
  const { i18n, t } = useTranslation();

  const handleSelect = (code: string) => {
    i18n.changeLanguage(code);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}>
        <View
          style={{
            backgroundColor: colors.background.secondary,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingBottom: spacing["3xl"],
          }}
        >
          {/* Handle */}
          <View style={{ alignItems: "center", paddingTop: spacing.sm }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.surface.border, marginBottom: spacing.md }} />
          </View>

          {/* Header */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, marginBottom: spacing.lg }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
              <Globe size={20} color={colors.primary.light} />
              <Text style={{ fontFamily: fontFamily.bold, fontSize: fontSize.xl, color: colors.text.primary }}>
                {t("profile.language")}
              </Text>
            </View>
            <Pressable testID="language-close" onPress={onClose}>
              <X size={22} color={colors.text.muted} />
            </Pressable>
          </View>

          {/* Language Options */}
          {LANGUAGES.map((lang) => {
            const isActive = i18n.language === lang.code;
            return (
              <Pressable
                key={lang.code}
                testID={`language-${lang.code}`}
                onPress={() => handleSelect(lang.code)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.lg,
                  backgroundColor: isActive ? colors.primary.muted : "transparent",
                }}
              >
                <Text style={{ fontSize: 24, marginRight: spacing.md }}>{lang.flag}</Text>
                <Text style={{
                  flex: 1,
                  fontFamily: isActive ? fontFamily.bold : fontFamily.regular,
                  fontSize: fontSize.base,
                  color: isActive ? colors.primary.light : colors.text.primary,
                }}>
                  {lang.label}
                </Text>
                {isActive && <Check size={20} color={colors.primary.light} />}
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}
