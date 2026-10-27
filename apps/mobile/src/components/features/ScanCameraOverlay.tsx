import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Camera as CameraIcon, ScanLine, Sparkles, Sun } from "lucide-react-native";
import { colors, fontFamily, fontSize, spacing } from "@/constants/theme";

type ScanCameraOverlayProps = {
  isScanning: boolean;
  onCapture: () => void;
  scansUsed?: number;
  scansLimit?: number;
  isUnlimited?: boolean;
};

export function ScanCameraOverlay({ isScanning, onCapture, scansUsed = 0, scansLimit = 5, isUnlimited = false }: ScanCameraOverlayProps) {
  const { t } = useTranslation();
  const scanCountColor = !isUnlimited && scansUsed >= scansLimit - 1 ? colors.warning.DEFAULT : colors.text.muted;

  return (
    <SafeAreaView
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "space-between",
      }}
    >
      {/* Top Bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: spacing.md,
          paddingHorizontal: spacing.lg,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
            backgroundColor: "rgba(0,0,0,0.5)",
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: 20,
          }}
        >
          <Sparkles size={16} color={colors.primary.light} />
          <Text
            style={{
              fontFamily: fontFamily.semibold,
              fontSize: fontSize.sm,
              color: colors.text.primary,
            }}
          >
            {t("scan.aiPowered")}
          </Text>
        </View>
        {!isUnlimited ? (
          <View style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            paddingHorizontal: spacing.sm,
            paddingVertical: 2,
            borderRadius: 12,
            marginTop: spacing.xs,
          }}>
            <Text style={{ fontFamily: fontFamily.medium, fontSize: fontSize.xs, color: scanCountColor }}>
              {scansUsed}/{scansLimit} {t("scan.scansThisMonth")}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Center Guide */}
      <View style={{ alignItems: "center" }}>
        <View
          style={{
            width: 260,
            height: 360,
            borderWidth: 2,
            borderColor: colors.primary.DEFAULT,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ScanLine size={32} color={colors.primary.light} />
        </View>
        <Text
          style={{
            fontFamily: fontFamily.regular,
            fontSize: fontSize.sm,
            color: colors.text.primary,
            marginTop: spacing.md,
            textAlign: "center",
          }}
        >
          {t("scan.placeCard")}
        </Text>

        {/* Anti-Glare Hint */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginTop: spacing.md,
            backgroundColor: "rgba(0,0,0,0.7)",
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: 20,
          }}
        >
          <Sun size={14} color={colors.warning.DEFAULT} />
          <Text
            style={{
              fontFamily: fontFamily.medium,
              fontSize: fontSize.xs,
              color: "#fff",
            }}
          >
            {t("scan.glareHint")}
          </Text>
        </View>
      </View>

      {/* Bottom Actions — extra padding for absolute tab bar */}
      <View style={{ alignItems: "center", paddingBottom: 120 }}>
        {isScanning ? (
          <View style={{ alignItems: "center", gap: spacing.sm }}>
            <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
            <Text
              style={{
                fontFamily: fontFamily.semibold,
                fontSize: fontSize.base,
                color: colors.text.primary,
              }}
            >
              {t("scan.analyzing")}
            </Text>
          </View>
        ) : (
          <Pressable
            testID="scan-capture-btn"
            onPress={onCapture}
            accessibilityLabel={t("scan.capture")}
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: colors.primary.DEFAULT,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 4,
              borderColor: "rgba(255,255,255,0.3)",
            }}
          >
            <CameraIcon size={28} color={colors.text.primary} />
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
