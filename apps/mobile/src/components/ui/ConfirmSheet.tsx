import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react-native";
import { colors, fontFamily, fontSize, spacing } from "@/constants/theme";

type ConfirmSheetProps = {
  visible: boolean;
  icon?: string;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  isLoading?: boolean;
  checkboxLabel?: string;
  checkboxRequired?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmSheet({
  visible,
  icon,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive = false,
  isLoading = false,
  checkboxLabel,
  checkboxRequired = false,
  onConfirm,
  onCancel,
}: ConfirmSheetProps) {
  const { t } = useTranslation();
  const [checked, setChecked] = useState(false);
  const [prevVisible, setPrevVisible] = useState(visible);

  // Reset the checkbox whenever the sheet closes (state adjustment during render, no effect needed)
  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (!visible) setChecked(false);
  }

  const isConfirmDisabled = isLoading || (checkboxRequired && Boolean(checkboxLabel) && !checked);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={isLoading ? undefined : onCancel}>
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}
        onPress={isLoading ? undefined : onCancel}
      >
        <Pressable
          onPress={() => {}}
          style={{
            backgroundColor: colors.background.tertiary,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: spacing["2xl"],
            paddingBottom: spacing["5xl"],
          }}
        >
          {/* Handle Bar */}
          <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.surface.border, alignSelf: "center", marginBottom: spacing.xl }} />

          {/* Icon */}
          {icon && (
            <View style={{ alignItems: "center", marginBottom: spacing.lg }}>
              <View style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: destructive ? colors.danger.muted : colors.primary.muted,
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Text style={{ fontSize: 28 }}>{icon}</Text>
              </View>
            </View>
          )}

          {/* Title */}
          <Text style={{
            fontFamily: fontFamily.bold,
            fontSize: fontSize.xl,
            color: colors.text.primary,
            textAlign: "center",
            marginBottom: spacing.sm,
          }}>
            {title}
          </Text>

          {/* Message */}
          <Text style={{
            fontFamily: fontFamily.regular,
            fontSize: fontSize.base,
            color: colors.text.muted,
            textAlign: "center",
            marginBottom: spacing.xl,
            paddingHorizontal: spacing.lg,
          }}>
            {message}
          </Text>

          {/* Checkbox */}
          {checkboxLabel && (
            <Pressable
              testID="confirm-sheet-checkbox"
              onPress={() => setChecked((c) => !c)}
              accessibilityLabel={checkboxLabel}
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: spacing.sm,
                marginBottom: spacing.xl,
                paddingHorizontal: spacing.sm,
              }}
            >
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 4,
                  borderWidth: 1.5,
                  borderColor: checked ? colors.primary.DEFAULT : colors.surface.border,
                  backgroundColor: checked ? colors.primary.DEFAULT : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 2,
                }}
              >
                {checked && <Check size={14} color="#fff" />}
              </View>
              <Text
                style={{
                  flex: 1,
                  fontFamily: fontFamily.regular,
                  fontSize: fontSize.sm,
                  color: colors.text.secondary,
                }}
              >
                {checkboxLabel}
              </Text>
            </Pressable>
          )}

          {/* Buttons */}
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <Pressable
              testID="confirm-sheet-cancel"
              onPress={onCancel}
              disabled={isLoading}
              style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: spacing.lg,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.surface.border,
                opacity: isLoading ? 0.5 : 1,
              }}
            >
              <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.base, color: colors.text.secondary }}>
                {cancelLabel ?? t("common.cancel")}
              </Text>
            </Pressable>
            <Pressable
              testID="confirm-sheet-confirm"
              onPress={onConfirm}
              disabled={isConfirmDisabled}
              style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: spacing.lg,
                borderRadius: 12,
                backgroundColor: destructive ? colors.danger.DEFAULT : colors.primary.DEFAULT,
                opacity: isConfirmDisabled ? 0.5 : 1,
              }}
            >
              <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.base, color: colors.text.primary }}>
                {isLoading ? t("common.loading") : (confirmLabel ?? t("common.done"))}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
