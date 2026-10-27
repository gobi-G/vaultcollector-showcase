import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { ChevronRight, Plus } from "lucide-react-native";
import { ICON_COMPONENTS } from "@/components/features/VaultLocationCard";
import { Package } from "lucide-react-native";
import { colors, fontFamily, fontSize, spacing } from "@/constants/theme";
import type { Location } from "@vault-collector/shared";

type VaultItem = {
  id: string;
  name: string;
  condition: string;
  image_url: string | null;
  current_market_price: number | null;
};

type VaultDrillDownViewProps = {
  locations: Location[] | undefined;
  locationItems: VaultItem[] | undefined;
  onNavigateInto: (location: Location) => void;
  onShowCreate: () => void;
};

export function VaultDrillDownView({
  locations,
  locationItems,
  onNavigateInto,
  onShowCreate,
}: VaultDrillDownViewProps) {
  const { t } = useTranslation();

  return (
    <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.md }}>
      {/* Sub-locations */}
      {locations?.map((loc) => (
        <Pressable
          key={loc.id}
          testID={`vault-location-${loc.id}`}
          onPress={() => onNavigateInto(loc)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            marginBottom: spacing.sm,
            borderRadius: 16,
            backgroundColor: colors.surface.default,
            borderWidth: 1,
            borderColor: colors.surface.border,
          }}
        >
          <View style={{
            width: 44,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 12,
            backgroundColor: colors.primary.muted,
          }}>
            {(() => { const I = ICON_COMPONENTS[loc.icon] ?? Package; return <I size={20} color={colors.primary.light} />; })()}
          </View>
          <Text style={{ flex: 1, fontFamily: fontFamily.semibold, fontSize: fontSize.base, color: colors.text.primary }}>
            {loc.name}
          </Text>
          <ChevronRight size={18} color={colors.text.muted} />
        </Pressable>
      ))}

      {/* Items at this location */}
      {locationItems && locationItems.length > 0 && (
        <>
          <Text style={{
            fontFamily: fontFamily.semibold,
            fontSize: fontSize.sm,
            color: colors.text.muted,
            marginTop: spacing.xl,
            marginBottom: spacing.md,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}>
            {t("vault.itemsHere", { count: locationItems.length })}
          </Text>
          {locationItems.map((item) => (
            <View
              key={item.id}
              testID={`vault-item-${item.id}`}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.md,
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.md,
                marginBottom: spacing.sm,
                borderRadius: 12,
                backgroundColor: colors.surface.default,
                borderWidth: 1,
                borderColor: colors.surface.border,
              }}
            >
              {item.image_url ? (
                <Image
                  source={{ uri: item.image_url }}
                  style={{ width: 40, height: 56, borderRadius: 4 }}
                  contentFit="contain"
                  placeholder={{ blurhash: "L03u%Vt700WB~qj[j[j[00WB~qof" }}
                  transition={200}
                />
              ) : (
                <View style={{
                  width: 40,
                  height: 56,
                  borderRadius: 4,
                  backgroundColor: colors.primary.muted,
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Text style={{ fontSize: 18 }}>🃏</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.sm, color: colors.text.primary }} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={{ fontFamily: fontFamily.regular, fontSize: fontSize.xs, color: colors.text.muted }}>
                  {item.condition.replace("_", " ")}
                </Text>
              </View>
              <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.sm, color: colors.success.DEFAULT }}>
                {item.current_market_price ? `$${item.current_market_price.toFixed(2)}` : "—"}
              </Text>
            </View>
          ))}
        </>
      )}

      {/* Empty drill-down */}
      {(!locations || locations.length === 0) && (!locationItems || locationItems.length === 0) && (
        <View style={{ alignItems: "center", marginTop: spacing["3xl"] }}>
          <Text style={{ fontFamily: fontFamily.regular, fontSize: fontSize.base, color: colors.text.muted }}>
            {t("vault.noSubLocations")}
          </Text>
          <Pressable
            onPress={onShowCreate}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.sm,
              marginTop: spacing.lg,
              paddingHorizontal: spacing.xl,
              paddingVertical: spacing.md,
              borderRadius: 12,
              backgroundColor: colors.primary.DEFAULT,
            }}
          >
            <Plus size={18} color={colors.text.primary} />
            <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.base, color: colors.text.primary }}>
              {t("vault.addLocation")}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
