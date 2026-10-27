import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Camera as CameraIcon } from "lucide-react-native";
import { Button } from "@/components/ui";
import { colors, fontFamily, fontSize, spacing } from "@/constants/theme";

type ScanPermissionViewProps = {
  onRequestPermission: () => void;
};

export function ScanPermissionView({ onRequestPermission }: ScanPermissionViewProps) {
  const { t } = useTranslation();

  return (
    <SafeAreaView
      testID="tabs-scan"
      style={{ flex: 1, backgroundColor: colors.background.primary }}
    >
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: spacing.xl,
        }}
      >
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: colors.primary.muted,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: spacing.xl,
          }}
        >
          <CameraIcon size={40} color={colors.primary.light} />
        </View>
        <Text
          style={{
            fontFamily: fontFamily.bold,
            fontSize: fontSize.xl,
            color: colors.text.primary,
            textAlign: "center",
            marginBottom: spacing.sm,
          }}
        >
          {t("scan.permissionTitle")}
        </Text>
        <Text
          style={{
            fontFamily: fontFamily.regular,
            fontSize: fontSize.base,
            color: colors.text.muted,
            textAlign: "center",
            marginBottom: spacing.xl,
          }}
        >
          {t("scan.permissionDescription")}
        </Text>
        <Button
          testID="scan-permission-btn"
          label={t("scan.grantPermission")}
          variant="primary"
          size="lg"
          onPress={onRequestPermission}
        />
      </View>
    </SafeAreaView>
  );
}
