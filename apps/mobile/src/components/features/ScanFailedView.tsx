import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { AlertCircle } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/constants/theme";
import { Button } from "@/components/ui";


type ScanFailedViewProps = {
  errorKey: string;
  onRetry: () => void;
  onManualSearch: () => void;
  onCancel: () => void;
  showUpgrade?: boolean;
};

export function ScanFailedView({
  errorKey,
  onRetry,
  onManualSearch,
  onCancel,
  showUpgrade = false,
}: ScanFailedViewProps) {
  const { t } = useTranslation();

  return (
    <SafeAreaView
      testID="scan-failed-view"
      className="flex-1 bg-bg-primary"
    >
      <View className="flex-1 items-center justify-center px-xl">
        <View className="mb-3xl items-center">
          <View className="mb-lg items-center justify-center rounded-full bg-danger-muted p-xl">
            <AlertCircle size={48} color={colors.danger.DEFAULT} />
          </View>

          <Text className="mb-sm text-center font-sans-bold text-2xl text-text-primary">
            {t("scan.failedTitle")}
          </Text>

          <Text className="text-center font-sans text-base text-text-secondary">
            {t(errorKey)}
          </Text>
        </View>

        <View className="w-full gap-md">
          {showUpgrade ? (
            <Button
              testID="scan-failed-upgrade-btn"
              label={t("scan.upgradePlan")}
              variant="primary"
              size="lg"
              className="w-full"
              onPress={onRetry}
              accessibilityLabel={t("scan.upgradePlan")}
            />
          ) : (
            <Button
              testID="scan-failed-retry-btn"
              label={t("scan.retryCapture")}
              variant="primary"
              size="lg"
              className="w-full"
              onPress={onRetry}
              accessibilityLabel={t("scan.retryCapture")}
            />
          )}

          <Button
            testID="scan-failed-manual-search-btn"
            label={t("scan.searchManually")}
            variant="outline"
            size="lg"
            className="w-full"
            onPress={onManualSearch}
            accessibilityLabel={t("scan.searchManually")}
          />

          <Button
            testID="scan-failed-cancel-btn"
            label={t("scan.cancelScan")}
            variant="ghost"
            size="md"
            className="w-full"
            onPress={onCancel}
            accessibilityLabel={t("scan.cancelScan")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
