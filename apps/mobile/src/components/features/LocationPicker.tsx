import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Check, ChevronRight, Package } from "lucide-react-native";
import { colors, fontFamily, fontSize, spacing } from "@/constants/theme";
import { useChildLocations, useRootLocations } from "@/hooks/queries";
import { ICON_COMPONENTS } from "@/components/features/VaultLocationCard";
import type { Location } from "@vault-collector/shared";

type LocationPickerProps = {
  visible: boolean;
  selectedId: string | null;
  onSelect: (location: Location) => void;
  onClear: () => void;
  onClose: () => void;
};

export function LocationPicker({ visible, selectedId, onSelect, onClear, onClose }: LocationPickerProps) {
  const { t } = useTranslation();
  const [currentParent, setCurrentParent] = useState<Location | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Location[]>([]);

  const { data: rootLocations } = useRootLocations();
  const { data: childLocations } = useChildLocations(currentParent?.id ?? null);

  const locations = currentParent ? childLocations : rootLocations;

  const handleNavigateInto = (location: Location) => {
    setBreadcrumbs([...breadcrumbs, location]);
    setCurrentParent(location);
  };

  const handleBack = () => {
    const newBc = breadcrumbs.slice(0, -1);
    setBreadcrumbs(newBc);
    setCurrentParent(newBc[newBc.length - 1] ?? null);
  };

  const handleSelect = (location: Location) => {
    onSelect(location);
    setBreadcrumbs([]);
    setCurrentParent(null);
  };

  const handleClose = () => {
    setBreadcrumbs([]);
    setCurrentParent(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={{ flex: 1, backgroundColor: colors.background.primary, paddingTop: 60 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg, marginBottom: spacing.lg }}>
          <Pressable onPress={currentParent ? handleBack : handleClose} accessibilityLabel={t("common.back")}>
            <ArrowLeft size={24} color={colors.text.primary} />
          </Pressable>
          <Text style={{ fontFamily: fontFamily.bold, fontSize: fontSize.xl, color: colors.text.primary, flex: 1, textAlign: "center" }}>
            {currentParent?.name ?? t("vault.selectLocation")}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, paddingHorizontal: spacing.lg, marginBottom: spacing.md }}>
            <Pressable onPress={() => { setBreadcrumbs([]); setCurrentParent(null); }}>
              <Text style={{ fontFamily: fontFamily.medium, fontSize: fontSize.xs, color: colors.primary.light }}>
                {t("vault.title")}
              </Text>
            </Pressable>
            {breadcrumbs.map((bc, i) => (
              <View key={bc.id} style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
                <Text style={{ color: colors.text.muted, fontSize: fontSize.xs }}>›</Text>
                <Pressable onPress={() => {
                  const newBc = breadcrumbs.slice(0, i + 1);
                  setBreadcrumbs(newBc);
                  setCurrentParent(newBc[newBc.length - 1] ?? null);
                }}>
                  <Text style={{ fontFamily: fontFamily.medium, fontSize: fontSize.xs, color: colors.primary.light }}>
                    {bc.name}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* Select current level */}
        {currentParent && (
          <Pressable
            testID="location-select-current"
            onPress={() => handleSelect(currentParent)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.md,
              marginHorizontal: spacing.lg,
              marginBottom: spacing.md,
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.lg,
              borderRadius: 12,
              backgroundColor: selectedId === currentParent.id ? colors.primary.muted : colors.surface.default,
              borderWidth: 1,
              borderColor: selectedId === currentParent.id ? colors.primary.DEFAULT : colors.surface.border,
            }}
          >
            <Check size={18} color={colors.primary.light} />
            <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.base, color: colors.primary.light }}>
              {t("vault.selectHere", { name: currentParent.name })}
            </Text>
          </Pressable>
        )}

        {/* Clear selection */}
        {selectedId && (
          <Pressable
            testID="location-clear"
            onPress={() => { onClear(); handleClose(); }}
            style={{
              marginHorizontal: spacing.lg,
              marginBottom: spacing.md,
              paddingVertical: spacing.sm,
              alignItems: "center",
            }}
          >
            <Text style={{ fontFamily: fontFamily.medium, fontSize: fontSize.sm, color: colors.danger.DEFAULT }}>
              {t("vault.clearLocation")}
            </Text>
          </Pressable>
        )}

        {/* Locations */}
        <ScrollView style={{ flex: 1, paddingHorizontal: spacing.lg }}>
          {(!locations || locations.length === 0) && (
            <Text style={{ fontFamily: fontFamily.regular, fontSize: fontSize.sm, color: colors.text.muted, textAlign: "center", marginTop: spacing.xl }}>
              {t("vault.noSubLocations")}
            </Text>
          )}
          {locations?.map((loc) => (
            <Pressable
              key={loc.id}
              testID={`location-pick-${loc.id}`}
              onPress={() => handleNavigateInto(loc)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.md,
                paddingVertical: spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: colors.surface.border,
              }}
            >
              {(() => { const I = ICON_COMPONENTS[loc.icon] ?? Package; return <I size={20} color={colors.primary.light} />; })()}
              <Text style={{ fontFamily: fontFamily.medium, fontSize: fontSize.base, color: colors.text.primary, flex: 1 }}>
                {loc.name}
              </Text>
              {selectedId === loc.id && <Check size={18} color={colors.success.DEFAULT} />}
              <ChevronRight size={18} color={colors.text.muted} />
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}
