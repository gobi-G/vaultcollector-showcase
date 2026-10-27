import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner-native";
import { ArrowLeft } from "lucide-react-native";
import { AddItemSearchResults } from "@/components/features/AddItemSearchResults";
import { AddItemSaveForm } from "@/components/features/AddItemSaveForm";
import { colors, fontFamily, fontSize, spacing } from "@/constants/theme";
import { ConfirmSheet } from "@/components/ui";
import { useAllUserItems, useCheckDuplicate, useCreateItem, useProfile, useSearchCards } from "@/hooks/queries";
import { useAuth } from "@/providers/AuthProvider";
import { canAddItem } from "@vault-collector/shared";
import type { CardSearchResult, Location, SubscriptionTier, TcgType } from "@vault-collector/shared";

type Step = "search" | "confirm";

export default function AddItemScreen() {
  const { collectionId } = useLocalSearchParams<{ collectionId: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();
  const createItem = useCreateItem();
  const checkDuplicate = useCheckDuplicate();
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const { data: profile } = useProfile();
  const { data: allItems } = useAllUserItems();

  const tier = (profile?.subscription_tier ?? "free") as SubscriptionTier;
  const currentCount = allItems?.length ?? 0;
  const isLimitReached = !canAddItem(tier, currentCount);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [step, setStep] = useState<Step>("search");

  // Auto-debounce: trigger search 500ms after user stops typing
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(query.trim().length >= 2 ? query.trim() : "");
    }, query.trim().length >= 2 ? 500 : 0);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [query]);
  const [selectedCard, setSelectedCard] = useState<CardSearchResult | null>(null);
  const [condition, setCondition] = useState<"mint" | "near_mint" | "played" | "damaged">("near_mint");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [purchasePrice, setPurchasePrice] = useState("");
  const [tcgType, setTcgType] = useState<TcgType>("pokemon");

  const { data: results, isLoading: isSearching } = useSearchCards(debouncedQuery, tcgType);

  const handleSearch = () => {
    if (query.trim().length >= 2) {
      setDebouncedQuery(query.trim());
    }
  };

  const handleSelectCard = (card: CardSearchResult) => {
    setSelectedCard(card);
    setStep("confirm");
  };

  const handleTcgTypeChange = (newType: TcgType) => {
    setTcgType(newType);
    setDebouncedQuery("");
    setQuery("");
    setSelectedCard(null);
    setStep("search");
  };

  const doSave = () => {
    if (!selectedCard || !user || !collectionId) return;
    createItem.mutate(
      {
        collection_id: collectionId,
        user_id: user.id,
        name: selectedCard.name,
        category: "tcg",
        metadata: {
          card_api_id: selectedCard.cardApiId,
          set_name: selectedCard.setName,
          card_number: selectedCard.cardNumber,
          rarity: selectedCard.rarity,
          tcg_type: tcgType,
        },
        condition,
        location_id: selectedLocation?.id ?? null,
        purchase_price: purchasePrice ? parseFloat(purchasePrice) : null,
        current_market_price: selectedCard.price,
        image_url: selectedCard.imageUrl,
        notes: null,
      },
      {
        onSuccess: () => {
          toast.success(t("item.added"));
          router.back();
        },
        onError: () => toast.error(t("common.error")),
      },
    );
  };

  const handleSave = async () => {
    if (!selectedCard || !collectionId) return;
    const count = await checkDuplicate(collectionId, selectedCard.name);
    if (count > 0) {
      setDuplicateCount(count);
      setShowDuplicateWarning(true);
      return;
    }
    doSave();
  };

  const tcgTypeLabels: Record<TcgType, string> = {
    pokemon: t("tcgType.pokemon"),
    magic: t("tcgType.magic"),
    yugioh: t("tcgType.yugioh"),
  };

  const insets = useSafeAreaInsets();

  return (
    <View testID="add-item-screen" style={{ flex: 1, backgroundColor: colors.background.primary, paddingTop: insets.top }}>
      <View style={{ flex: 1, paddingHorizontal: spacing.lg }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingTop: spacing.md, marginBottom: spacing.lg }}>
          <Pressable
            testID="add-item-back"
            onPress={() => step === "confirm" ? setStep("search") : router.back()}
            accessibilityLabel={t("common.back")}
          >
            <ArrowLeft size={24} color={colors.text.primary} />
          </Pressable>
          <Text style={{ fontFamily: fontFamily.bold, fontSize: fontSize.xl, color: colors.text.primary, marginLeft: spacing.md }}>
            {step === "search" ? t("item.searchCard") : t("item.addToCollection")}
          </Text>
        </View>

        {step === "search" && (
          <AddItemSearchResults
            query={query}
            onQueryChange={setQuery}
            onSearch={handleSearch}
            isSearching={isSearching}
            results={results}
            debouncedQuery={debouncedQuery}
            onSelectCard={handleSelectCard}
            tcgType={tcgType}
            onTcgTypeChange={handleTcgTypeChange}
            tcgTypeLabels={tcgTypeLabels}
            isLimitReached={isLimitReached}
            currentCount={currentCount}
          />
        )}

        {step === "confirm" && selectedCard && !isLimitReached && (
          <AddItemSaveForm
            selectedCard={selectedCard}
            condition={condition}
            onConditionChange={setCondition}
            selectedLocation={selectedLocation}
            onLocationChange={setSelectedLocation}
            showLocationPicker={showLocationPicker}
            onShowLocationPicker={setShowLocationPicker}
            purchasePrice={purchasePrice}
            onPurchasePriceChange={setPurchasePrice}
            onSave={handleSave}
            isSaving={createItem.isPending}
          />
        )}
      </View>

      <ConfirmSheet
        visible={showDuplicateWarning}
        title={t("item.duplicateTitle")}
        message={t("item.duplicateWarning", { count: duplicateCount, name: selectedCard?.name ?? "" })}
        confirmLabel={t("item.addAnyway")}
        onConfirm={() => {
          setShowDuplicateWarning(false);
          doSave();
        }}
        onCancel={() => setShowDuplicateWarning(false)}
      />
    </View>
  );
}
