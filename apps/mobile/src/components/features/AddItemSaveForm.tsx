import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { MapPin } from "lucide-react-native";
import { Input } from "@/components/ui";
import { LocationPicker } from "@/components/features/LocationPicker";
import { colors, fontFamily, fontSize, spacing } from "@/constants/theme";
import type { CardSearchResult, Location } from "@vault-collector/shared";

type AddItemSaveFormProps = {
  selectedCard: CardSearchResult;
  condition: "mint" | "near_mint" | "played" | "damaged";
  onConditionChange: (c: "mint" | "near_mint" | "played" | "damaged") => void;
  selectedLocation: Location | null;
  onLocationChange: (loc: Location | null) => void;
  showLocationPicker: boolean;
  onShowLocationPicker: (show: boolean) => void;
  purchasePrice: string;
  onPurchasePriceChange: (price: string) => void;
  onSave: () => void;
  isSaving: boolean;
};

export function AddItemSaveForm({
  selectedCard,
  condition,
  onConditionChange,
  selectedLocation,
  onLocationChange,
  showLocationPicker,
  onShowLocationPicker,
  purchasePrice,
  onPurchasePriceChange,
  onSave,
  isSaving,
}: AddItemSaveFormProps) {
  const { t } = useTranslation();

  const conditions: { key: typeof condition; label: string }[] = [
    { key: "mint", label: t("condition.mint") },
    { key: "near_mint", label: t("condition.nearMint") },
    { key: "played", label: t("condition.played") },
    { key: "damaged", label: t("condition.damaged") },
  ];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: spacing.xl }} keyboardShouldPersistTaps="handled">
      {/* Card Preview */}
      <View style={{ alignItems: "center", marginBottom: spacing.xl }}>
        <Image
          source={{ uri: selectedCard.imageUrl }}
          style={{ width: 160, height: 224, borderRadius: 8 }}
          resizeMode="contain"
        />
        <Text style={{ fontFamily: fontFamily.bold, fontSize: fontSize.xl, color: colors.text.primary, marginTop: spacing.md }}>
          {selectedCard.name}
        </Text>
        <Text style={{ fontFamily: fontFamily.regular, fontSize: fontSize.sm, color: colors.text.muted }}>
          {selectedCard.setName}
        </Text>
        {selectedCard.price && (
          <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.lg, color: colors.success.DEFAULT, marginTop: spacing.xs }}>
            ${selectedCard.price.toFixed(2)}
          </Text>
        )}
      </View>

      {/* Condition */}
      <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.base, color: colors.text.secondary, marginBottom: spacing.sm }}>
        {t("item.condition")}
      </Text>
      <View style={{ flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg }}>
        {conditions.map((c) => (
          <Pressable
            key={c.key}
            testID={`condition-${c.key}`}
            onPress={() => onConditionChange(c.key)}
            style={{
              flex: 1,
              alignItems: "center",
              paddingVertical: spacing.sm,
              borderRadius: 8,
              backgroundColor: condition === c.key ? colors.primary.DEFAULT : colors.surface.default,
              borderWidth: 1,
              borderColor: condition === c.key ? colors.primary.DEFAULT : colors.surface.border,
            }}
          >
            <Text style={{
              fontFamily: fontFamily.medium,
              fontSize: fontSize.xs,
              color: condition === c.key ? colors.text.primary : colors.text.muted,
            }}>
              {c.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Location */}
      <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.base, color: colors.text.secondary, marginBottom: spacing.sm }}>
        {t("item.location")}
      </Text>
      <Pressable
        testID="add-item-location"
        onPress={() => onShowLocationPicker(true)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sm,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.surface.border,
          backgroundColor: colors.background.primary,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
        }}
        accessibilityLabel={t("item.location")}
      >
        <MapPin size={18} color={selectedLocation ? colors.primary.light : colors.text.muted} />
        <Text style={{
          fontFamily: fontFamily.regular,
          fontSize: fontSize.base,
          color: selectedLocation ? colors.text.primary : colors.text.muted,
          flex: 1,
        }}>
          {selectedLocation?.name ?? t("vault.selectLocation")}
        </Text>
      </Pressable>

      <LocationPicker
        visible={showLocationPicker}
        selectedId={selectedLocation?.id ?? null}
        onSelect={(loc) => { onLocationChange(loc); onShowLocationPicker(false); }}
        onClear={() => onLocationChange(null)}
        onClose={() => onShowLocationPicker(false)}
      />

      {/* Purchase Price */}
      <View style={{ marginTop: spacing.md }}>
        <Input
          testID="add-item-price"
          label={t("item.purchasePrice")}
          value={purchasePrice}
          onChangeText={onPurchasePriceChange}
          placeholder="0.00"
          keyboardType="decimal-pad"
          accessibilityLabel={t("item.purchasePrice")}
        />
      </View>

      {/* Save Button */}
      <Pressable
        testID="add-item-save-btn"
        onPress={onSave}
        disabled={isSaving}
        style={{
          marginTop: spacing.xl,
          alignItems: "center",
          paddingVertical: spacing.lg,
          borderRadius: 12,
          backgroundColor: colors.primary.DEFAULT,
          opacity: isSaving ? 0.5 : 1,
        }}
        accessibilityLabel={t("item.addToCollection")}
      >
        <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.base, color: colors.text.primary }}>
          {isSaving ? t("common.loading") : t("item.addToCollection")}
        </Text>
      </Pressable>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}
