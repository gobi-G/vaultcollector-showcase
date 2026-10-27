import { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Plus, X } from "lucide-react-native";
import { toast } from "sonner-native";
import { colors, fontFamily, fontSize, spacing } from "@/constants/theme";
import { useCreateLocation } from "@/hooks/queries";
import { useAuth } from "@/providers/AuthProvider";
import { ICON_COMPONENTS, ICON_LABELS } from "./VaultLocationCard";
import type { Location } from "@vault-collector/shared";

const ICON_OPTIONS = Object.entries(ICON_COMPONENTS).map(([key, Icon]) => ({
  key: key as Location["icon"],
  Icon,
  labelKey: ICON_LABELS[key],
}));

type CreateLocationSheetProps = {
  visible: boolean;
  parentId: string | null;
  parentName?: string;
  onClose: () => void;
};

export function CreateLocationSheet({ visible, parentId, parentName, onClose }: CreateLocationSheetProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const createLocation = useCreateLocation();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<Location["icon"]>("box");

  const handleCreate = () => {
    if (!name.trim() || !user) return;
    createLocation.mutate(
      {
        name: name.trim(),
        user_id: user.id,
        parent_id: parentId,
        icon,
      },
      {
        onSuccess: () => {
          toast.success(t("vault.created"));
          setName("");
          setIcon("box");
          onClose();
        },
        onError: () => toast.error(t("common.error")),
      },
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}>
          <Pressable onPress={onClose} style={{ flex: 1 }} />
          <View
            style={{
              backgroundColor: colors.background.secondary,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingHorizontal: spacing.xl,
              paddingBottom: spacing["5xl"],
            }}
          >
          {/* Handle */}
          <View style={{ alignItems: "center", paddingTop: spacing.sm }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.surface.border, marginBottom: spacing.lg }} />
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.xl }}>
            <Text style={{ fontFamily: fontFamily.bold, fontSize: fontSize.xl, color: colors.text.primary }}>
              {t("vault.addLocation")}
            </Text>
            <Pressable testID="create-location-close" onPress={onClose}>
              <X size={22} color={colors.text.muted} />
            </Pressable>
          </View>

          {/* Parent Info */}
          {parentName && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs, marginBottom: spacing.lg }}>
              <Text style={{ fontFamily: fontFamily.regular, fontSize: fontSize.sm, color: colors.text.muted }}>
                {t("vault.addingTo")}
              </Text>
              <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.sm, color: colors.primary.light }}>
                {parentName}
              </Text>
            </View>
          )}

          {/* Icon Picker — 2-Column Grid */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.xl }}>
            {ICON_OPTIONS.map(({ key, Icon, labelKey }) => {
              const isSelected = icon === key;
              return (
                <Pressable
                  key={key}
                  testID={`vault-icon-${key}`}
                  onPress={() => setIcon(key)}
                  style={{
                    width: "48%",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing.sm,
                    paddingVertical: spacing.sm,
                    paddingHorizontal: spacing.md,
                    borderRadius: 12,
                    backgroundColor: isSelected ? colors.primary.muted : colors.background.primary,
                    borderWidth: 1.5,
                    borderColor: isSelected ? colors.primary.DEFAULT : colors.surface.border,
                  }}
                >
                  <Icon size={20} color={isSelected ? colors.primary.light : colors.text.muted} />
                  <Text style={{
                    fontFamily: isSelected ? fontFamily.semibold : fontFamily.regular,
                    fontSize: fontSize.sm,
                    color: isSelected ? colors.primary.light : colors.text.secondary,
                  }}>
                    {t(labelKey)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Name Input */}
          <TextInput
            testID="vault-name-input"
            value={name}
            onChangeText={setName}
            placeholder={t("vault.namePlaceholder")}
            placeholderTextColor={colors.text.muted}
            autoFocus={false}
            style={{
              fontFamily: fontFamily.regular,
              fontSize: fontSize.base,
              color: colors.text.primary,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.surface.border,
              backgroundColor: colors.background.primary,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.lg,
              marginBottom: spacing.xl,
            }}
          />

          {/* Create Button */}
          <Pressable
            testID="vault-create-submit"
            onPress={handleCreate}
            disabled={!name.trim() || createLocation.isPending}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: spacing.sm,
              paddingVertical: spacing.lg,
              borderRadius: 12,
              backgroundColor: colors.primary.DEFAULT,
              opacity: name.trim() ? 1 : 0.5,
            }}
          >
            <Plus size={18} color={colors.text.primary} />
            <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.base, color: colors.text.primary }}>
              {createLocation.isPending ? t("common.loading") : t("vault.addLocation")}
            </Text>
          </Pressable>
          </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
