import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ChevronRight, FolderOpen, Plus } from "lucide-react-native";
import { GlassCard } from "@/components/ui";
import { colors, fontFamily, fontSize, spacing } from "@/constants/theme";

type Collection = {
  id: string;
  name: string;
};

type ScanSaveCollectionListProps = {
  collections: Collection[] | undefined;
  onSelectCollection: (id: string) => void;
  onClose?: () => void;
};

export function ScanSaveCollectionList({
  collections,
  onSelectCollection,
  onClose,
}: ScanSaveCollectionListProps) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <ScrollView style={{ paddingHorizontal: spacing.lg }}>
      {(!collections || collections.length === 0) ? (
        <GlassCard className="items-center py-xl">
          <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.base, color: colors.text.primary, textAlign: "center" }}>
            {t("scan.noCollections")}
          </Text>
          <Text style={{ fontFamily: fontFamily.regular, fontSize: fontSize.sm, color: colors.text.muted, textAlign: "center", marginTop: spacing.xs }}>
            {t("scan.noCollectionsHint")}
          </Text>
          <Pressable
            testID="scan-create-collection-btn"
            onPress={() => {
              router.push("/(tabs)/collection/create");
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: spacing.sm,
              marginTop: spacing.lg,
              paddingVertical: spacing.md,
              paddingHorizontal: spacing["2xl"],
              backgroundColor: colors.primary.DEFAULT,
              borderRadius: 12,
            }}
          >
            <Plus size={18} color={colors.text.primary} />
            <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.base, color: colors.text.primary }}>
              {t("collection.createFirst")}
            </Text>
          </Pressable>
        </GlassCard>
      ) : (
        collections.map((collection) => (
          <Pressable
            key={collection.id}
            testID={`scan-collection-${collection.id}`}
            onPress={() => onSelectCollection(collection.id)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.md,
              borderBottomWidth: 1,
              borderBottomColor: colors.surface.border,
            }}
          >
            <FolderOpen size={20} color={colors.primary.light} />
            <Text style={{ flex: 1, fontFamily: fontFamily.semibold, fontSize: fontSize.base, color: colors.text.primary, marginLeft: spacing.md }}>
              {collection.name}
            </Text>
            <ChevronRight size={18} color={colors.text.muted} />
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}
