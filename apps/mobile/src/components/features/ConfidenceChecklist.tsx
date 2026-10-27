import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { CheckCircle, ChevronDown, XCircle } from "lucide-react-native";
import { colors, fontFamily, fontSize, spacing } from "@/constants/theme";

type ConfidenceChecks = {
  name: boolean;
  number: boolean;
  set: boolean;
  image: boolean;
};

type ConfidenceChecklistProps = {
  confidence: number;
  checks: ConfidenceChecks | null;
};

const CHECK_ITEMS: { key: keyof ConfidenceChecks; labelKey: string }[] = [
  { key: "name", labelKey: "scan.checkName" },
  { key: "number", labelKey: "scan.checkId" },
  { key: "set", labelKey: "scan.checkSet" },
  { key: "image", labelKey: "scan.checkImage" },
];

function getBadgeConfig(confidencePercent: number) {
  if (confidencePercent >= 80) {
    return {
      labelKey: "scan.confidenceHigh",
      color: colors.success.DEFAULT,
      bgColor: colors.success.muted,
      defaultExpanded: false,
    };
  }
  if (confidencePercent >= 50) {
    return {
      labelKey: "scan.confidenceMedium",
      color: colors.warning.DEFAULT,
      bgColor: colors.warning.muted,
      defaultExpanded: true,
    };
  }
  return {
    labelKey: "scan.confidenceLow",
    color: colors.danger.DEFAULT,
    bgColor: colors.danger.muted,
    defaultExpanded: true,
  };
}

export function ConfidenceChecklist({
  confidence,
  checks,
}: ConfidenceChecklistProps) {
  const { t } = useTranslation();
  const confidencePercent = Math.round(confidence * 100);
  const badge = getBadgeConfig(confidencePercent);
  const [expanded, setExpanded] = useState(badge.defaultExpanded);

  return (
    <View style={{ marginBottom: spacing.md }}>
      <Pressable
        onPress={() => setExpanded((prev) => !prev)}
        accessibilityLabel={t(badge.labelKey)}
        accessibilityRole="button"
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sm,
          backgroundColor: badge.bgColor,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderRadius: 8,
        }}
      >
        <Text
          style={{
            flex: 1,
            fontFamily: fontFamily.semibold,
            fontSize: fontSize.sm,
            color: badge.color,
          }}
        >
          {t(badge.labelKey)}
        </Text>
        <ChevronDown
          size={16}
          color={badge.color}
          style={{
            transform: [{ rotate: expanded ? "180deg" : "0deg" }],
          }}
        />
      </Pressable>

      {expanded && checks ? (
        <View style={{ marginTop: spacing.sm, gap: spacing.xs, paddingLeft: spacing.xs }}>
          {CHECK_ITEMS.map((item) => {
            const passed = checks[item.key];
            return (
              <View
                key={item.key}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.sm,
                }}
              >
                {passed ? (
                  <CheckCircle size={16} color={colors.success.DEFAULT} />
                ) : (
                  <XCircle size={16} color={colors.warning.DEFAULT} />
                )}
                <Text
                  style={{
                    fontFamily: fontFamily.regular,
                    fontSize: fontSize.sm,
                    color: passed
                      ? colors.text.primary
                      : colors.text.secondary,
                  }}
                >
                  {t(item.labelKey)}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
