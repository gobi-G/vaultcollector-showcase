import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Check, MapPin } from "lucide-react-native";
import { Button, GlassCard } from "@/components/ui";
import { colors, fontFamily, fontSize, spacing } from "@/constants/theme";

type Location = {
  id: string;
  name: string;
  icon: string;
};

type ScanSaveDetailsStepProps = {
  collectionName: string | undefined;
  selectedCondition: "mint" | "near_mint" | "played" | "damaged";
  onConditionChange: (c: "mint" | "near_mint" | "played" | "damaged") => void;
  locations: Location[] | undefined;
  selectedLocationId: string | null;
  onLocationToggle: (id: string) => void;
  purchasePrice: string;
  onPurchasePriceChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  onSave: () => void;
  isSaving: boolean;
};

const CONDITIONS = ["mint", "near_mint", "played", "damaged"] as const;

export function ScanSaveDetailsStep({
  collectionName,
  selectedCondition,
  onConditionChange,
  locations,
  selectedLocationId,
  onLocationToggle,
  purchasePrice,
  onPurchasePriceChange,
  notes,
  onNotesChange,
  onSave,
  isSaving,
}: ScanSaveDetailsStepProps) {
  const { t } = useTranslation();

  return (
    <ScrollView style={{ paddingHorizontal: spacing.lg }}>
      {/* Selected Collection */}
      <GlassCard>
        <Text style={{ fontFamily: fontFamily.regular, fontSize: fontSize.xs, color: colors.text.muted, marginBottom: spacing.xs }}>
          {t("collection.title")}
        </Text>
        <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.base, color: colors.text.primary }}>
          {collectionName}
        </Text>
      </GlassCard>

      {/* Condition Picker */}
      <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.base, color: colors.text.primary, marginTop: spacing.lg, marginBottom: spacing.sm }}>
        {t("item.condition")}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
        {CONDITIONS.map((c) => (
          <Pressable
            key={c}
            testID={`scan-condition-${c}`}
            onPress={() => onConditionChange(c)}
            style={{
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: selectedCondition === c ? colors.primary.DEFAULT : colors.surface.border,
              backgroundColor: selectedCondition === c ? colors.primary.muted : "transparent",
            }}
          >
            <Text style={{
              fontFamily: fontFamily.semibold,
              fontSize: fontSize.sm,
              color: selectedCondition === c ? colors.primary.light : colors.text.muted,
            }}>
              {t(`condition.${c}`)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Location Picker */}
      <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.base, color: colors.text.primary, marginTop: spacing.lg, marginBottom: spacing.sm }}>
        {t("item.location")} ({t("common.optional")})
      </Text>
      {locations && locations.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
          {locations.map((loc) => (
            <Pressable
              key={loc.id}
              testID={`scan-location-${loc.id}`}
              onPress={() => onLocationToggle(loc.id)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.xs,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: selectedLocationId === loc.id ? colors.primary.DEFAULT : colors.surface.border,
                backgroundColor: selectedLocationId === loc.id ? colors.primary.muted : "transparent",
                marginRight: spacing.sm,
              }}
            >
              <MapPin size={14} color={selectedLocationId === loc.id ? colors.primary.light : colors.text.muted} />
              <Text style={{
                fontFamily: fontFamily.semibold,
                fontSize: fontSize.sm,
                color: selectedLocationId === loc.id ? colors.primary.light : colors.text.muted,
              }}>
                {loc.icon} {loc.name}
              </Text>
              {selectedLocationId === loc.id && <Check size={14} color={colors.primary.light} />}
            </Pressable>
          ))}
        </ScrollView>
      ) : (
        <Text style={{ fontFamily: fontFamily.regular, fontSize: fontSize.sm, color: colors.text.muted, marginBottom: spacing.md }}>
          {t("scan.noLocations")}
        </Text>
      )}

      {/* Purchase Price */}
      <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.base, color: colors.text.primary, marginTop: spacing.lg, marginBottom: spacing.sm }}>
        {t("item.purchasePrice")} ({t("common.optional")})
      </Text>
      <TextInput
        testID="scan-purchase-price"
        value={purchasePrice}
        onChangeText={onPurchasePriceChange}
        placeholder="0.00"
        placeholderTextColor={colors.text.muted}
        keyboardType="decimal-pad"
        style={{
          fontFamily: fontFamily.regular,
          fontSize: fontSize.base,
          color: colors.text.primary,
          backgroundColor: colors.surface.default,
          borderWidth: 1,
          borderColor: colors.surface.border,
          borderRadius: 12,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.md,
        }}
        accessibilityLabel={t("item.purchasePrice")}
      />

      {/* Notes */}
      <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.base, color: colors.text.primary, marginTop: spacing.lg, marginBottom: spacing.sm }}>
        {t("item.notes")} ({t("common.optional")})
      </Text>
      <TextInput
        testID="scan-notes"
        value={notes}
        onChangeText={onNotesChange}
        placeholder={t("item.notesPlaceholder")}
        placeholderTextColor={colors.text.muted}
        multiline
        numberOfLines={3}
        style={{
          fontFamily: fontFamily.regular,
          fontSize: fontSize.base,
          color: colors.text.primary,
          backgroundColor: colors.surface.default,
          borderWidth: 1,
          borderColor: colors.surface.border,
          borderRadius: 12,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.md,
          minHeight: 80,
          textAlignVertical: "top",
        }}
        accessibilityLabel={t("item.notes")}
      />

      {/* Save Button */}
      <View style={{ marginTop: spacing.xl }}>
        <Button
          testID="scan-save-btn"
          label={isSaving ? t("common.loading") : t("scan.saveItem")}
          variant="primary"
          size="lg"
          onPress={onSave}
          disabled={isSaving}
        />
      </View>
    </ScrollView>
  );
}
