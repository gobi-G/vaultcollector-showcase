import { Pressable, Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { colors } from "@/constants/theme";

type SettingsRowProps = {
  testID?: string;
  icon: React.ReactNode;
  label: string;
  value?: string;
  danger?: boolean;
  onPress?: () => void;
};

export function SettingsRow({ testID, icon, label, value, danger = false, onPress }: SettingsRowProps) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      className="flex-row items-center justify-between py-md"
      accessibilityLabel={label}
    >
      <View className="flex-row items-center gap-md">
        {icon}
        <Text
          className={`font-sans text-base ${
            danger ? "text-danger" : "text-text-primary"
          }`}
        >
          {label}
        </Text>
      </View>
      <View className="flex-row items-center gap-xs">
        {value && <Text className="font-sans text-sm text-text-muted">{value}</Text>}
        <ChevronRight size={16} color={colors.text.muted} />
      </View>
    </Pressable>
  );
}
