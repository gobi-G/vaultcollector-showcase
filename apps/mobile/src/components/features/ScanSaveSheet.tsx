import { useEffect, useState } from "react";
import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react-native";
import { toast } from "sonner-native";
import { ScanSaveCollectionList } from "@/components/features/ScanSaveCollectionList";
import { ScanSaveDetailsStep } from "@/components/features/ScanSaveDetailsStep";
import { colors, fontFamily, fontSize, spacing } from "@/constants/theme";
import { useEnsureDefaultCollection } from "@/hooks/queries/useEnsureDefaultCollection";
import { useCollections } from "@/hooks/queries/useCollections";
import { ConfirmSheet } from "@/components/ui";
import { useCheckDuplicate, useCreateItem } from "@/hooks/queries/useItems";
import { useLocations } from "@/hooks/queries/useLocations";
import { useAuth } from "@/providers";

type ScanSaveSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
  cardName: string;
  cardSet: string;
  cardNumber: string;
  estimatedCondition: string;
  rarity?: string;
  tcgType?: "pokemon" | "yugioh" | "magic";
  marketPrice?: number | null;
  imageUrl?: string;
  cardApiId?: string;
};

type Step = "collection" | "details";

const CONDITIONS = ["mint", "near_mint", "played", "damaged"] as const;

export function ScanSaveSheet({
  visible,
  onClose,
  onSaved,
  cardName,
  cardSet,
  cardNumber,
  estimatedCondition,
  rarity,
  tcgType,
  marketPrice,
  imageUrl,
  cardApiId,
}: ScanSaveSheetProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: collections } = useCollections();
  const { ensureCollection, isCreating } = useEnsureDefaultCollection();
  const { data: locations } = useLocations();
  const createItem = useCreateItem();
  const checkDuplicate = useCheckDuplicate();
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [step, setStep] = useState<Step>("collection");
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<typeof CONDITIONS[number]>(
    (CONDITIONS.includes(estimatedCondition as typeof CONDITIONS[number]) ? estimatedCondition : "near_mint") as typeof CONDITIONS[number]
  );
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [purchasePrice, setPurchasePrice] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (visible && collections && collections.length === 0 && !isCreating) {
      ensureCollection().then((id) => {
        setSelectedCollectionId(id);
        setStep("details");
      }).catch(() => {
        toast.error(t("common.error"));
      });
    }
  }, [visible, collections, ensureCollection, isCreating, t]);

  const handleSelectCollection = (id: string) => {
    setSelectedCollectionId(id);
    setStep("details");
  };

  const doSave = () => {
    if (!selectedCollectionId || !user || isSaving) return;
    setIsSaving(true);

    createItem.mutate(
      {
        collection_id: selectedCollectionId,
        user_id: user.id,
        name: cardName,
        category: "tcg",
        metadata: {
          card_api_id: cardApiId ?? "",
          set_name: cardSet,
          rarity: rarity ?? "",
          card_number: cardNumber,
          tcg_type: tcgType ?? "pokemon",
        },
        condition: selectedCondition,
        location_id: selectedLocationId,
        image_url: imageUrl ?? null,
        purchase_price: purchasePrice ? parseFloat(purchasePrice) : null,
        current_market_price: marketPrice ?? null,
        notes: notes.trim() || null,
      },
      {
        onSuccess: () => {
          toast.success(t("scan.savedSuccess"));
          handleClose();
          onSaved();
        },
        onError: () => {
          setIsSaving(false);
          toast.error(t("scan.saveFailed"));
        },
      },
    );
  };

  const handleSave = async () => {
    if (!selectedCollectionId) return;
    const count = await checkDuplicate(selectedCollectionId, cardName);
    if (count > 0) {
      setDuplicateCount(count);
      setShowDuplicateWarning(true);
      return;
    }
    doSave();
  };

  const handleClose = () => {
    setStep("collection");
    setSelectedCollectionId(null);
    setSelectedCondition(
      (CONDITIONS.includes(estimatedCondition as typeof CONDITIONS[number]) ? estimatedCondition : "near_mint") as typeof CONDITIONS[number]
    );
    setSelectedLocationId(null);
    setPurchasePrice("");
    setNotes("");
    setIsSaving(false);
    onClose();
  };

  const selectedCollection = collections?.find((c) => c.id === selectedCollectionId);

  return (
    <>
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}>
        <View
          style={{
            backgroundColor: colors.background.secondary,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: "80%",
            paddingBottom: spacing["3xl"],
          }}
        >
          {/* Handle + Header */}
          <View style={{ alignItems: "center", paddingTop: spacing.sm }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.surface.border, marginBottom: spacing.md }} />
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, marginBottom: spacing.lg }}>
            <Text style={{ fontFamily: fontFamily.bold, fontSize: fontSize.xl, color: colors.text.primary }}>
              {step === "collection" ? t("scan.chooseCollection") : t("scan.confirmDetails")}
            </Text>
            <Pressable testID="scan-save-close" onPress={handleClose}>
              <X size={22} color={colors.text.muted} />
            </Pressable>
          </View>

          {step === "collection" ? (
            isCreating ? (
              <View style={{ padding: spacing["3xl"], alignItems: "center" }}>
                <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
                <Text style={{ fontFamily: fontFamily.regular, fontSize: fontSize.base, color: colors.text.muted, marginTop: spacing.lg }}>
                  {t("firstRun.creatingCollection")}
                </Text>
              </View>
            ) : (
              <ScanSaveCollectionList
                collections={collections}
                onSelectCollection={handleSelectCollection}
                onClose={handleClose}
              />
            )
          ) : (
            <ScanSaveDetailsStep
              collectionName={selectedCollection?.name}
              selectedCondition={selectedCondition}
              onConditionChange={setSelectedCondition}
              locations={locations}
              selectedLocationId={selectedLocationId}
              onLocationToggle={(id) => setSelectedLocationId(selectedLocationId === id ? null : id)}
              purchasePrice={purchasePrice}
              onPurchasePriceChange={setPurchasePrice}
              notes={notes}
              onNotesChange={setNotes}
              onSave={handleSave}
              isSaving={isSaving}
            />
          )}
        </View>
      </View>
    </Modal>

    <ConfirmSheet
      visible={showDuplicateWarning}
      title={t("item.duplicateTitle")}
      message={t("item.duplicateWarning", { count: duplicateCount, name: cardName })}
      confirmLabel={t("item.addAnyway")}
      onConfirm={() => {
        setShowDuplicateWarning(false);
        doSave();
      }}
      onCancel={() => setShowDuplicateWarning(false)}
    />
    </>
  );
}
