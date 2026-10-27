import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import type { CardSearchResult } from "@vault-collector/shared";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { CircleX } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from "react-native-vision-camera";
import { ConfirmSheet } from "@/components/ui";
import { ScanCameraOverlay } from "@/components/features/ScanCameraOverlay";
import { ScanFailedView } from "@/components/features/ScanFailedView";
import { ScanLineOverlay } from "@/components/features/ScanLineOverlay";
import { ScanPermissionView } from "@/components/features/ScanPermissionView";
import { ScanResultView } from "@/components/features/ScanResultView";
import { ScanSaveSheet } from "@/components/features/ScanSaveSheet";
import { ScanSuggestionView } from "@/components/features/ScanSuggestionView";
import { VariantSelectorSheet } from "@/components/features/VariantSelectorSheet";
import { FirstScanSuccessView } from "@/components/features/FirstScanSuccessView";
import { colors } from "@/constants/theme";
import { aiScanService } from "@/services";
import { useScanUsage } from "@/hooks/queries";
import { useCardLookup } from "@/hooks/useCardLookup";
import { useAiConsent } from "@/hooks/useAiConsent";
import { compressAndEncodeImage } from "@/utils/ImageUtils";
import { validateCapturedImage } from "@/utils/ImageValidation";
import { logger } from "@/utils/Logger";
import { storage } from "@/utils/storage";

type ScanPhase = "idle" | "compress" | "ai" | "lookup" | "done";

const SCAN_PHASE_KEYS: Record<Exclude<ScanPhase, "idle">, string> = {
  compress: "scan.phaseCompress",
  ai: "scan.phaseAi",
  lookup: "scan.phaseLookup",
  done: "scan.phaseAlmostDone",
};

type ScanResult = {
  name: string;
  tcgType: "pokemon" | "yugioh" | "magic";
  set: string;
  number: string;
  rarity: string;
  estimatedCondition: string;
  confidence: number;
  checks: { name: boolean; number: boolean; set: boolean; image: boolean } | null;
  imageUrl?: string;
  price?: number | null;
  passcode?: string | null;
  edition?: string | null;
  variant?: string | null;
};

type ScanError = {
  key: string;
  showUpgrade: boolean;
};

type FirstScanSuccessData = {
  cardName: string;
  imageUrl: string | undefined;
  marketPrice: number | null;
  portfolioValue: number;
};

function classifyScanError(error: unknown): ScanError {
  if (error instanceof Error) {
    if (error.message.startsWith("SCAN_LIMIT_REACHED")) {
      return { key: "scan.errorLimitReached", showUpgrade: true };
    }
    const msg = error.message.toLowerCase();
    if (msg.includes("network") || msg.includes("fetch") || msg.includes("internet") || msg.includes("offline")) {
      return { key: "scan.errorOffline", showUpgrade: false };
    }
  }

  const statusCode = typeof error === "object" && error !== null && "status" in error
    ? (error as Record<string, unknown>).status
    : undefined;
  if (statusCode === 429) {
    return { key: "scan.errorLimitReached", showUpgrade: true };
  }
  if (statusCode === 502 || statusCode === 503) {
    return { key: "scan.errorServer", showUpgrade: false };
  }

  return { key: "scan.errorGeneric", showUpgrade: false };
}

export default function ScanScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice("back");
  const { hasPermission, requestPermission } = useCameraPermission();

  const queryClient = useQueryClient();
  const scanUsage = useScanUsage();
  const { lookup } = useCardLookup();

  const [isScanning, setIsScanning] = useState(false);
  const [scanPhase, setScanPhase] = useState<ScanPhase>("idle");
  const [frozenPhoto, setFrozenPhoto] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [alternativeCards, setAlternativeCards] = useState<CardSearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSaveSheet, setShowSaveSheet] = useState(false);
  const [artworkData, setArtworkData] = useState<{ images: ArtworkImage[]; matchedIndex: number; matchConfidence: number } | null>(null);
  const [showArtworkSelector, setShowArtworkSelector] = useState(false);
  const [showAiConsent, setShowAiConsent] = useState(false);
  const [scanError, setScanError] = useState<ScanError | null>(null);
  const [savedItem, setSavedItem] = useState<FirstScanSuccessData | null>(null);
  const scannedBase64Ref = useRef<string | null>(null);
  const aiResultRef = useRef<{
    name: string;
    tcgType: string;
    confidence: number;
    estimatedCondition: string;
    edition?: string | null;
    variant?: string | null;
  } | null>(null);
  const { isConsentGiven, grantConsent } = useAiConsent();

  const handleRequestPermission = useCallback(async () => {
    const granted = await requestPermission();
    logger.info("Camera", "Permission request", { granted });
  }, [requestPermission]);

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current) return;

    if (!isConsentGiven()) {
      setShowAiConsent(true);
      return;
    }

    try {
      setIsScanning(true);
      logger.info("Scan", "Taking photo...");
      const photo = await cameraRef.current.takePhoto();
      logger.info("Scan", "Photo captured", { path: photo.path });

      // Freeze frame immediately
      setFrozenPhoto(`file://${photo.path}`);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

      // Validate image before sending to AI
      const validation = await validateCapturedImage(`file://${photo.path}`);
      if (!validation.valid) {
        const issueKeyMap: Record<string, string> = {
          too_dark: "scan.errorDark",
          too_blurry: "scan.errorBlurry",
          too_small: "scan.errorGeneric",
        };
        const errorKey = issueKeyMap[validation.issue ?? ""] ?? "scan.errorGeneric";
        setScanPhase("idle");
        setScanError({ key: errorKey, showUpgrade: false });
        return;
      }

      setScanPhase("compress");
      const base64 = await compressAndEncodeImage(photo.path);
      scannedBase64Ref.current = base64;
      setScanPhase("ai");
      const result = await aiScanService.recognizeCard(base64);
      logger.info("Scan", "AI scan result", result);

      if (!result.name || result.confidence < 0.3) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        setScanPhase("idle");
        setScanError({ key: "scan.errorNoCard", showUpgrade: false });
        return;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

      // Fetch exact card data using precise identifiers, fallback to name search
      setScanPhase("lookup");
      const lookupResult = await lookup(result, base64);
      setAlternativeCards(lookupResult.alternativeCards);
      if (lookupResult.artworkData) {
        setArtworkData(lookupResult.artworkData);
      }

      setScanPhase("done");

      // Store AI result for suggestion flow
      aiResultRef.current = {
        name: lookupResult.correctedName ?? result.name,
        tcgType: result.tcgType,
        confidence: lookupResult.confidence,
        estimatedCondition: result.estimatedCondition,
        edition: result.edition ?? null,
        variant: result.variant ?? null,
      };

      // Medium confidence with alternatives → show suggestion picker
      if (
        lookupResult.confidence >= 0.3 &&
        lookupResult.confidence < 0.7 &&
        lookupResult.alternativeCards.length > 0
      ) {
        setShowSuggestions(true);
        queryClient.invalidateQueries({ queryKey: ["scanUsage"] });
        return;
      }

      setScanResult({
        name: lookupResult.correctedName ?? result.name,
        tcgType: result.tcgType,
        set: lookupResult.correctedSet ?? result.set,
        number: lookupResult.correctedNumber ?? result.number,
        rarity: result.rarity,
        estimatedCondition: result.estimatedCondition,
        confidence: lookupResult.confidence,
        checks: lookupResult.checks,
        imageUrl: lookupResult.imageUrl,
        price: lookupResult.price,
        passcode: result.passcode ?? null,
        edition: result.edition ?? null,
        variant: result.variant ?? null,
      });

      queryClient.invalidateQueries({ queryKey: ["scanUsage"] });
    } catch (error: unknown) {
      let message: string;
      if (error instanceof Error) {
        message = `${error.name}: ${error.message}`;
      } else if (typeof error === "string") {
        message = error;
      } else {
        try {
          message = JSON.stringify(error, Object.getOwnPropertyNames(error as object));
        } catch {
          message = `Unknown error type: ${typeof error}`;
        }
      }
      logger.error("Scan", "Capture failed", { error: message });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setScanPhase("idle");
      setScanError(classifyScanError(error));
    } finally {
      setIsScanning(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setScanResult(null);
    setFrozenPhoto(null);
    setAlternativeCards([]);
    setShowSuggestions(false);
    setArtworkData(null);
    setShowArtworkSelector(false);
    setScanPhase("idle");
    setScanError(null);
    setSavedItem(null);
    scannedBase64Ref.current = null;
    aiResultRef.current = null;
  }, []);

  const handleSelectAlternative = useCallback((card: CardSearchResult) => {
    if (!scanResult) return;
    setScanResult({
      ...scanResult,
      imageUrl: card.imageUrl,
      price: card.price ?? null,
      set: card.setName,
      number: card.cardNumber ?? scanResult.number,
    });
  }, [scanResult]);

  const handleSelectSuggestion = useCallback((card: CardSearchResult) => {
    const ai = aiResultRef.current;
    setShowSuggestions(false);
    setScanResult({
      name: card.name,
      tcgType: (ai?.tcgType ?? "pokemon") as "pokemon" | "yugioh" | "magic",
      set: card.setName,
      number: card.cardNumber ?? "",
      rarity: card.rarity ?? "",
      estimatedCondition: ai?.estimatedCondition ?? "near_mint",
      confidence: ai?.confidence ?? 0.5,
      checks: null,
      imageUrl: card.imageUrl,
      price: card.price ?? null,
      passcode: card.passcode ?? null,
      edition: ai?.edition ?? null,
      variant: ai?.variant ?? null,
    });
  }, []);

  const handleNoneMatch = useCallback(() => {
    setShowSuggestions(false);
    setScanError({ key: "scan.errorNoCard", showUpgrade: false });
  }, []);

  const handleAddToCollection = useCallback(() => {
    if (artworkData && artworkData.matchConfidence < 0.7) {
      setShowArtworkSelector(true);
    } else {
      setShowSaveSheet(true);
    }
  }, [artworkData]);

  const handleSaved = useCallback(() => {
    const hasSeen = storage.getBoolean("has_seen_first_scan_success");
    if (!hasSeen && scanResult) {
      const portfolioValue = (scanResult.price ?? 0);
      setSavedItem({
        cardName: scanResult.name,
        imageUrl: scanResult.imageUrl,
        marketPrice: scanResult.price ?? null,
        portfolioValue,
      });
      storage.set("has_seen_first_scan_success", true);
    } else {
      handleReset();
    }
  }, [scanResult, handleReset]);

  const handleManualSearch = useCallback(() => {
    handleReset();
    router.push("/(tabs)/collection/add-item");
  }, [handleReset, router]);

  if (!hasPermission) {
    return <ScanPermissionView onRequestPermission={handleRequestPermission} />;
  }

  if (!device) {
    return (
      <SafeAreaView testID="tabs-scan" className="flex-1 bg-bg-primary">
        <View className="flex-1 items-center justify-center">
          <CircleX size={48} color={colors.danger.DEFAULT} />
          <Text className="mt-lg font-sans-semibold text-lg text-text-primary">
            {t("scan.noCameraDevice")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (scanError) {
    return (
      <ScanFailedView
        errorKey={scanError.key}
        onRetry={scanError.showUpgrade
          ? () => { handleReset(); router.push("/paywall"); }
          : handleReset}
        onManualSearch={handleManualSearch}
        onCancel={handleReset}
        showUpgrade={scanError.showUpgrade}
      />
    );
  }

  if (showSuggestions && alternativeCards.length > 0) {
    return (
      <ScanSuggestionView
        suggestions={alternativeCards}
        scanResult={{
          name: aiResultRef.current?.name ?? "",
          tcgType: aiResultRef.current?.tcgType ?? "pokemon",
          confidence: aiResultRef.current?.confidence ?? 0.5,
        }}
        onSelectCard={handleSelectSuggestion}
        onNoneMatch={handleNoneMatch}
        onReset={handleReset}
      />
    );
  }

  if (savedItem) {
    return (
      <FirstScanSuccessView
        {...savedItem}
        onScanMore={() => { setSavedItem(null); handleReset(); }}
        onViewPortfolio={() => { setSavedItem(null); handleReset(); router.push("/(tabs)"); }}
      />
    );
  }

  if (scanResult) {
    return (
      <ScanResultView
        scanResult={scanResult}
        alternativeCards={alternativeCards}
        onReset={handleReset}
        onAddToCollection={handleAddToCollection}
        onSelectAlternative={handleSelectAlternative}
      >
        <ScanSaveSheet
          visible={showSaveSheet}
          onClose={() => setShowSaveSheet(false)}
          onSaved={handleSaved}
          cardName={scanResult.name}
          cardSet={scanResult.set}
          cardNumber={scanResult.number}
          estimatedCondition={scanResult.estimatedCondition}
          rarity={scanResult.rarity}
          tcgType={scanResult.tcgType}
          marketPrice={scanResult.price ?? null}
          imageUrl={scanResult.imageUrl}
        />
        {showArtworkSelector && artworkData && (
          <VariantSelectorSheet
            visible
            card={{
              cardApiId: scanResult.passcode ?? "",
              name: scanResult.name,
              setName: scanResult.set,
              setCode: null,
              imageUrl: scanResult.imageUrl ?? "",
              rarity: scanResult.rarity,
              price: scanResult.price ?? null,
              cardNumber: scanResult.number,
              passcode: scanResult.passcode ?? null,
              setVersions: null,
              artworkImages: artworkData.images,
            }}
            initialArtworkIndex={artworkData.matchedIndex}
            artworkOnly
            onSelect={(selected) => {
              setScanResult({ ...scanResult, imageUrl: selected.imageUrl });
              setShowArtworkSelector(false);
              setShowSaveSheet(true);
            }}
            onClose={() => {
              setShowArtworkSelector(false);
              setShowSaveSheet(true);
            }}
          />
        )}
      </ScanResultView>
    );
  }

  return (
    <View testID="tabs-scan" className="flex-1 bg-black">
      <Camera
        ref={cameraRef}
        style={{ flex: 1 }}
        device={device}
        isActive={!frozenPhoto}
        photo={true}
      />
      {frozenPhoto ? (
        <ScanLineOverlay
          phaseText={scanPhase !== "idle" ? t(SCAN_PHASE_KEYS[scanPhase]) : t("scan.analyzing")}
        />
      ) : (
        <ScanCameraOverlay
          isScanning={isScanning}
          onCapture={handleCapture}
          scansUsed={scanUsage.used}
          scansLimit={scanUsage.limit}
          isUnlimited={scanUsage.isUnlimited}
        />
      )}
      <ConfirmSheet
        visible={showAiConsent}
        title={t("scan.aiConsentTitle")}
        message={t("scan.aiConsentMessage")}
        confirmLabel={t("scan.aiConsentAccept")}
        checkboxLabel={t("scan.aiConsentCheckbox")}
        checkboxRequired
        onConfirm={() => {
          grantConsent();
          setShowAiConsent(false);
          handleCapture();
        }}
        onCancel={() => setShowAiConsent(false)}
      />
    </View>
  );
}
