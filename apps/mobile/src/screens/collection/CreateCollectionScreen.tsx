import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner-native";
import { Boxes, CreditCard, Watch } from "lucide-react-native";
import { Button, Input } from "@/components/ui";
import { colors, fontFamily, fontSize, spacing } from "@/constants/theme";
import { useCollections, useCreateCollection, useProfile } from "@/hooks/queries";
import { useAuth } from "@/providers/AuthProvider";
import { canAddCollection } from "@vault-collector/shared";
import type { SubscriptionTier } from "@vault-collector/shared";

const CATEGORIES = [
  { key: "tcg", icon: CreditCard, color: colors.primary.light, bg: colors.primary.muted },
  { key: "lego", icon: Boxes, color: colors.warning.light, bg: colors.warning.muted },
  { key: "watch", icon: Watch, color: colors.danger.light, bg: colors.danger.muted },
] as const;

export default function CreateCollectionScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();
  const createCollection = useCreateCollection();
  const { data: profile } = useProfile();
  const { data: collections } = useCollections();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"tcg" | "lego" | "watch">("tcg");

  const tier = (profile?.subscription_tier ?? "free") as SubscriptionTier;
  const collectionCount = collections?.length ?? 0;
  const isLimitReached = !canAddCollection(tier, collectionCount);

  const handleCreate = () => {
    if (!name.trim() || !user || isLimitReached) return;
    createCollection.mutate(
      {
        name: name.trim(),
        description: description.trim() || null,
        category: selectedCategory,
        user_id: user.id,
        cover_image_url: null,
      },
      {
        onSuccess: () => {
          toast.success(t("collection.created"));
          router.back();
        },
        onError: () => toast.error(t("common.error")),
      },
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <View style={{ flex: 1, paddingHorizontal: spacing["2xl"], paddingTop: spacing["2xl"] }}>
        {/* Back */}
        <Pressable
          testID="create-collection-back"
          onPress={() => router.back()}
          accessibilityLabel={t("common.back")}
          style={{ marginBottom: spacing["3xl"] }}
        >
          <Text style={{ fontFamily: fontFamily.medium, fontSize: fontSize.lg, color: colors.primary.light }}>
            {t("common.back")}
          </Text>
        </Pressable>

        {/* Title */}
        <Text
          style={{
            fontFamily: fontFamily.bold,
            fontSize: fontSize["3xl"],
            color: colors.text.primary,
            marginBottom: spacing["3xl"],
          }}
        >
          {t("collection.createCollection")}
        </Text>

        {/* Name Input */}
        <Input
          testID="create-collection-name"
          label={t("collection.collectionName")}
          value={name}
          onChangeText={setName}
          placeholder={t("collection.namePlaceholder")}
          accessibilityLabel={t("collection.collectionName")}
        />

        {/* Description Input */}
        <View style={{ marginTop: spacing.lg }}>
          <Input
            testID="create-collection-description"
            label={t("collection.descriptionLabel")}
            value={description}
            onChangeText={setDescription}
            placeholder={t("collection.descriptionPlaceholder")}
            accessibilityLabel={t("collection.descriptionLabel")}
          />
        </View>

        {/* Category Selection */}
        <Text
          style={{
            fontFamily: fontFamily.semibold,
            fontSize: fontSize.base,
            color: colors.text.secondary,
            marginTop: spacing.xl,
            marginBottom: spacing.md,
          }}
        >
          {t("collection.category")}
        </Text>
        <View style={{ flexDirection: "row", gap: spacing.md }}>
          {CATEGORIES.map(({ key, icon: Icon, color, bg }) => {
            const isSelected = selectedCategory === key;
            const isComingSoon = key !== "tcg";
            return (
              <Pressable
                key={key}
                testID={`create-collection-category-${key}`}
                onPress={() => !isComingSoon && setSelectedCategory(key)}
                accessibilityLabel={t(`categories.${key === "tcg" ? "tcgCards" : key === "lego" ? "legoSets" : "watches"}`)}
                style={{
                  flex: 1,
                  alignItems: "center",
                  paddingVertical: spacing.lg,
                  borderRadius: 12,
                  backgroundColor: bg,
                  borderWidth: isSelected ? 2 : 0,
                  borderColor: isSelected ? color : "transparent",
                  opacity: isComingSoon ? 0.4 : 1,
                }}
              >
                <Icon size={24} color={color} />
                <Text
                  style={{
                    fontFamily: fontFamily.semibold,
                    fontSize: fontSize.xs,
                    color: color,
                    marginTop: spacing.xs,
                  }}
                >
                  {t(`categories.${key === "tcg" ? "tcgCards" : key === "lego" ? "legoSets" : "watches"}`)}
                </Text>
                {isComingSoon && (
                  <Text
                    style={{
                      fontFamily: fontFamily.regular,
                      fontSize: 9,
                      color: colors.text.muted,
                      marginTop: 2,
                    }}
                  >
                    {t("comingSoon")}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Create Button */}
        <Button
          testID="create-collection-submit"
          label={createCollection.isPending ? t("common.loading") : t("collection.createCollection")}
          variant="primary"
          size="lg"
          onPress={handleCreate}
          disabled={createCollection.isPending || !name.trim() || isLimitReached}
          style={{ marginTop: spacing["3xl"], width: "100%" }}
          accessibilityLabel={t("collection.createCollection")}
        />
      </View>
    </SafeAreaView>
  );
}
