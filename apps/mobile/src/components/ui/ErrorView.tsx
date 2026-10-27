import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react-native";
import { colors, spacing } from "@/constants/theme";

type ErrorViewProps = {
  message?: string;
  onRetry?: () => void;
};

export function ErrorView({ message, onRetry }: ErrorViewProps) {
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl }}>
      <AlertTriangle size={48} color={colors.danger.DEFAULT} />
      <Text style={{ color: colors.text.primary, fontFamily: "PlusJakartaSans-Bold", fontSize: 18, marginTop: spacing.md, textAlign: "center" }}>
        {t("error.oops")}
      </Text>
      <Text style={{ color: colors.text.secondary, fontFamily: "PlusJakartaSans-Regular", fontSize: 14, marginTop: spacing.sm, textAlign: "center" }}>
        {message ?? t("error.somethingWentWrong")}
      </Text>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          style={{ marginTop: spacing.lg, backgroundColor: colors.primary.DEFAULT, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: 8 }}
        >
          <Text style={{ color: colors.text.primary, fontFamily: "PlusJakartaSans-SemiBold", fontSize: 14 }}>
            {t("error.tryAgain")}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
