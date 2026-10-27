import { useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { colors, fontFamily, fontSize, spacing } from "@/constants/theme";

type EditNameModalProps = {
  visible: boolean;
  initialName: string;
  isLoading: boolean;
  onSave: (name: string) => void;
  onClose: () => void;
};

export function EditNameModal({ visible, initialName, isLoading, onSave, onClose }: EditNameModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(initialName);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      onShow={() => setName(initialName)}
    >
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", paddingHorizontal: spacing["2xl"] }}
        onPress={onClose}
      >
        <Pressable
          onPress={() => {}}
          style={{
            backgroundColor: colors.background.tertiary,
            borderRadius: 16,
            padding: spacing["2xl"],
            borderWidth: 1,
            borderColor: colors.surface.border,
          }}
        >
          <Text style={{ fontFamily: fontFamily.bold, fontSize: fontSize.xl, color: colors.text.primary, marginBottom: spacing.lg }}>
            {t("profile.editName")}
          </Text>
          <TextInput
            testID="profile-name-input"
            value={name}
            onChangeText={setName}
            placeholder={t("profile.namePlaceholder")}
            placeholderTextColor={colors.text.muted}
            autoFocus
            style={{
              fontFamily: fontFamily.regular,
              fontSize: fontSize.base,
              color: colors.text.primary,
              backgroundColor: colors.background.primary,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.surface.border,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
            }}
          />
          <View style={{ flexDirection: "row", gap: spacing.md, marginTop: spacing.lg }}>
            <Pressable
              testID="profile-name-cancel"
              onPress={onClose}
              style={{ flex: 1, alignItems: "center", paddingVertical: spacing.md, borderRadius: 12, borderWidth: 1, borderColor: colors.surface.border }}
            >
              <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.base, color: colors.text.secondary }}>
                {t("common.cancel")}
              </Text>
            </Pressable>
            <Pressable
              testID="profile-name-save"
              onPress={() => onSave(name.trim())}
              disabled={isLoading || !name.trim()}
              style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: spacing.md,
                borderRadius: 12,
                backgroundColor: colors.primary.DEFAULT,
                opacity: isLoading || !name.trim() ? 0.5 : 1,
              }}
            >
              <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.base, color: colors.text.primary }}>
                {isLoading ? t("common.loading") : t("common.save")}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
