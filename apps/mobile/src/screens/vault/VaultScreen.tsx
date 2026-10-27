import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ChevronRight, Lock, Plus } from "lucide-react-native";
import { CreateLocationSheet } from "@/components/features";
import { VaultRootView } from "@/components/features/VaultRootView";
import { VaultDrillDownView } from "@/components/features/VaultDrillDownView";
import { colors, fontFamily, fontSize, spacing } from "@/constants/theme";
import {
  useAllUserItems,
  useChildLocations,
  useItemsByLocation,
  useLocations,
  useRootLocations,
} from "@/hooks/queries";
import type { Location } from "@vault-collector/shared";

export default function VaultScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [currentParent, setCurrentParent] = useState<Location | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Location[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  const { data: rootLocations } = useRootLocations();
  const { data: allLocations } = useLocations();
  const { data: childLocations } = useChildLocations(currentParent?.id ?? null);
  const { data: locationItems } = useItemsByLocation(currentParent?.id ?? null);
  const { data: allItems } = useAllUserItems();

  const locations = currentParent ? childLocations : rootLocations;
  const isRoot = !currentParent;

  const locationStats = useMemo(() => {
    if (!rootLocations || !allLocations || !allItems) return {};

    const locationToRoot: Record<string, string> = {};
    const rootIds = new Set(rootLocations.map((l) => l.id));

    const findRoot = (locId: string): string | null => {
      if (locationToRoot[locId]) return locationToRoot[locId];
      if (rootIds.has(locId)) {
        locationToRoot[locId] = locId;
        return locId;
      }
      const loc = allLocations.find((l) => l.id === locId);
      if (!loc || !loc.parent_id) return null;
      const root = findRoot(loc.parent_id);
      if (root) locationToRoot[locId] = root;
      return root;
    };

    for (const loc of allLocations) {
      findRoot(loc.id);
    }

    const stats: Record<string, { count: number; value: number }> = {};
    for (const loc of rootLocations) {
      stats[loc.id] = { count: 0, value: 0 };
    }
    for (const item of allItems) {
      if (!item.location_id) continue;
      const rootId = locationToRoot[item.location_id];
      if (rootId && stats[rootId]) {
        stats[rootId].count++;
        stats[rootId].value += item.current_market_price ?? 0;
      }
    }
    return stats;
  }, [rootLocations, allLocations, allItems]);

  const chartData = useMemo(() => {
    if (!rootLocations) return [];
    return rootLocations
      .map((loc) => ({
        value: locationStats[loc.id]?.value ?? 0,
        label: loc.name.substring(0, 8),
        frontColor: colors.primary.DEFAULT,
        topLabelComponent: () => (
          <Text style={{ fontFamily: fontFamily.regular, fontSize: 10, color: colors.text.muted }}>
            ${(locationStats[loc.id]?.value ?? 0).toLocaleString()}
          </Text>
        ),
      }))
      .filter((d) => d.value > 0);
  }, [rootLocations, locationStats]);

  const totalVaultValue = useMemo(() => {
    if (!allItems) return 0;
    return allItems.reduce((sum, item) => sum + (item.current_market_price ?? 0), 0);
  }, [allItems]);

  const handleNavigateInto = (loc: Location) => { setBreadcrumbs([...breadcrumbs, loc]); setCurrentParent(loc); };
  const handleNavigateBack = () => { const bc = breadcrumbs.slice(0, -1); setBreadcrumbs(bc); setCurrentParent(bc[bc.length - 1] ?? null); };

  return (
    <SafeAreaView testID="vault-screen" style={{ flex: 1, backgroundColor: colors.background.primary }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm }}>
        <Pressable
          testID="vault-back-btn"
          onPress={currentParent ? handleNavigateBack : () => router.replace("/(tabs)/profile")}
          accessibilityLabel={t("common.back")}
          style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}
        >
          <ArrowLeft size={22} color={colors.text.primary} />
        </Pressable>
        <View style={{ flex: 1, alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Lock size={16} color={colors.primary.light} />
            <Text style={{ fontFamily: fontFamily.bold, fontSize: fontSize.xl, color: colors.text.primary }}>
              {currentParent?.name ?? t("vault.title")}
            </Text>
          </View>
        </View>
        <Pressable
          testID="vault-add-btn"
          onPress={() => setShowCreate(true)}
          accessibilityLabel={t("vault.addLocation")}
          style={{
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 20,
            backgroundColor: colors.primary.muted,
          }}
        >
          <Plus size={20} color={colors.primary.light} />
        </Pressable>
      </View>

      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: spacing.xs, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }}>
          <Pressable onPress={() => { setBreadcrumbs([]); setCurrentParent(null); }}>
            <Text style={{ fontFamily: fontFamily.medium, fontSize: fontSize.xs, color: colors.primary.light }}>
              🔒 Vault
            </Text>
          </Pressable>
          {breadcrumbs.map((bc, i) => (
            <View key={bc.id} style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
              <ChevronRight size={12} color={colors.text.muted} />
              <Pressable onPress={() => {
                const newBc = breadcrumbs.slice(0, i + 1);
                setBreadcrumbs(newBc);
                setCurrentParent(newBc[newBc.length - 1] ?? null);
              }}>
                <Text style={{
                  fontFamily: fontFamily.medium,
                  fontSize: fontSize.xs,
                  color: i === breadcrumbs.length - 1 ? colors.text.primary : colors.primary.light,
                }}>
                  {bc.name}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: spacing["5xl"] }}>
        {isRoot && (
          <VaultRootView
            locations={locations}
            locationStats={locationStats}
            chartData={chartData}
            totalVaultValue={totalVaultValue}
            onNavigateInto={handleNavigateInto}
            onShowCreate={() => setShowCreate(true)}
          />
        )}

        {!isRoot && (
          <VaultDrillDownView
            locations={locations}
            locationItems={locationItems}
            onNavigateInto={handleNavigateInto}
            onShowCreate={() => setShowCreate(true)}
          />
        )}
      </ScrollView>

      <CreateLocationSheet
        visible={showCreate}
        parentId={currentParent?.id ?? null}
        parentName={currentParent?.name}
        onClose={() => setShowCreate(false)}
      />
    </SafeAreaView>
  );
}
