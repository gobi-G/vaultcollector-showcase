import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner-native";
import { ArrowLeft, Check } from "lucide-react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, X } from "lucide-react-native";
import { getFullLocationPath } from "@vault-collector/shared";
import { Button, GlassCard } from "@/components/ui";
import { LocationPicker } from "@/components/features";
import { colors, fontFamily, fontSize, spacing } from "@/constants/theme";
import { useLocations } from "@/hooks/queries";
import { itemRepository } from "@/services";

const CONDITIONS = ["mint", "near_mint", "played", "damaged"] as const;

export default function EditItemScreen() {
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: item, isLoading } = useQuery({
    queryKey: ["item", itemId],
    queryFn: () => itemRepository.getById(itemId),
    enabled: !!itemId,
  });

  const [condition, setCondition] = useState<typeof CONDITIONS[number] | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [purchasePrice, setPurchasePrice] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const { data: allLocations } = useLocations();

  // Initialize form with item data once loaded
  useEffect(() => {
    if (item && !initialized) {
      setCondition(item.condition as typeof CONDITIONS[number]);
      setLocationId(item.location_id ?? null);
      setPurchasePrice(item.purchase_price?.toString() ?? "");
      setNotes(item.notes ?? "");
      setInitialized(true);
    }
  }, [item, initialized]);

  const handleSave = async () => {
    if (!item || !condition) return;
    setIsSaving(true);

    try {
      await itemRepository.update({
        id: item.id,
        condition,
        location_id: locationId,
        purchase_price: purchasePrice ? parseFloat(purchasePrice) : null,
        notes: notes.trim() || null,
      });

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ["item", itemId] });
      await queryClient.invalidateQueries({ queryKey: ["items"] });

      toast.success(t("item.updated"));
      router.back();
    } catch {
      toast.error(t("common.error"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !item) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: colors.text.muted }}>{t("common.loading")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView testID="edit-item-screen" style={{ flex: 1, backgroundColor: colors.background.primary }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md }}>
        <Pressable
          testID="edit-item-back"
          onPress={() => router.back()}
          accessibilityLabel={t("common.back")}
          style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}
        >
          <ArrowLeft size={22} color={colors.text.primary} />
        </Pressable>
        <Text style={{ fontFamily: fontFamily.bold, fontSize: fontSize.xl, color: colors.text.primary }}>
          {t("item.edit")}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: spacing.lg }} contentContainerStyle={{ paddingBottom: spacing["5xl"] }}>
        {/* Item Name (read-only) */}
        <Text style={{ fontFamily: fontFamily.bold, fontSize: fontSize["2xl"], color: colors.text.primary, marginBottom: spacing.xs }}>
          {item.name}
        </Text>
        <Text style={{ fontFamily: fontFamily.regular, fontSize: fontSize.sm, color: colors.text.muted, marginBottom: spacing.xl }}>
          {(item.metadata as { set_name?: string })?.set_name ?? ""}
        </Text>

        {/* Condition */}
        <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.base, color: colors.text.primary, marginBottom: spacing.md }}>
          {t("item.condition")}
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.xl }}>
          {CONDITIONS.map((c) => {
            const isSelected = condition === c;
            return (
              <Pressable
                key={c}
                testID={`edit-condition-${c}`}
                onPress={() => setCondition(c)}
                style={{
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.md,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isSelected ? colors.primary.DEFAULT : colors.surface.border,
                  backgroundColor: isSelected ? colors.primary.muted : "transparent",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.sm,
                }}
              >
                {isSelected && <Check size={14} color={colors.primary.light} />}
                <Text style={{
                  fontFamily: isSelected ? fontFamily.bold : fontFamily.regular,
                  fontSize: fontSize.sm,
                  color: isSelected ? colors.primary.light : colors.text.muted,
                }}>
                  {t(`condition.${c}`)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Location */}
        <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.base, color: colors.text.primary, marginBottom: spacing.md }}>
          {t("item.location")}
        </Text>
        <Pressable
          testID="edit-location-btn"
          onPress={() => setShowLocationPicker(true)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            padding: spacing.lg,
            borderRadius: 12,
            backgroundColor: colors.surface.default,
            borderWidth: 1,
            borderColor: colors.surface.border,
          }}
        >
          <MapPin size={18} color={colors.text.muted} />
          <Text style={{ flex: 1, fontFamily: fontFamily.regular, fontSize: fontSize.base, color: locationId ? colors.text.primary : colors.text.muted }}>
            {locationId && allLocations ? getFullLocationPath(allLocations, locationId) : t("item.locationPlaceholder")}
          </Text>
          {locationId && (
            <Pressable onPress={() => setLocationId(null)} hitSlop={8}>
              <X size={16} color={colors.text.muted} />
            </Pressable>
          )}
        </Pressable>

        {/* Purchase Price */}
        <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.base, color: colors.text.primary, marginTop: spacing.xl, marginBottom: spacing.md }}>
          {t("item.purchasePrice")}
        </Text>
        <GlassCard>
          <TextInput
            testID="edit-purchase-price"
            value={purchasePrice}
            onChangeText={setPurchasePrice}
            placeholder="0.00"
            placeholderTextColor={colors.text.muted}
            keyboardType="decimal-pad"
            style={{
              fontFamily: fontFamily.regular,
              fontSize: fontSize.base,
              color: colors.text.primary,
            }}
          />
        </GlassCard>

        {/* Notes */}
        <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.base, color: colors.text.primary, marginTop: spacing.xl, marginBottom: spacing.md }}>
          {t("item.notes")}
        </Text>
        <GlassCard>
          <TextInput
            testID="edit-notes"
            value={notes}
            onChangeText={setNotes}
            placeholder={t("item.notesPlaceholder")}
            placeholderTextColor={colors.text.muted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={{
              fontFamily: fontFamily.regular,
              fontSize: fontSize.base,
              color: colors.text.primary,
              minHeight: 100,
            }}
          />
        </GlassCard>

        {/* Save Button */}
        <View style={{ marginTop: spacing.xl }}>
          <Button
            testID="edit-item-save"
            label={isSaving ? t("common.loading") : t("common.save")}
            variant="primary"
            size="lg"
            onPress={handleSave}
            disabled={isSaving}
          />
        </View>
      </ScrollView>

      <LocationPicker
        visible={showLocationPicker}
        selectedId={locationId}
        onSelect={(loc) => { setLocationId(loc.id); setShowLocationPicker(false); }}
        onClear={() => { setLocationId(null); setShowLocationPicker(false); }}
        onClose={() => setShowLocationPicker(false)}
      />
    </SafeAreaView>
  );
}
