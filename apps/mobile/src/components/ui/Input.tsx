import { Text, TextInput, View } from "react-native";
import type { TextInputProps } from "react-native";
import { colors } from "@/constants/theme";

type InputProps = TextInputProps & {
  label?: string;
  className?: string;
};

export function Input({ label, className = "", ...props }: InputProps) {
  return (
    <View className={className}>
      {label && (
        <Text className="mb-xs font-sans-medium text-sm text-text-secondary">
          {label}
        </Text>
      )}
      <TextInput
        className="rounded-md border border-surface-border bg-surface px-lg py-md font-sans text-base text-text-primary"
        placeholderTextColor={colors.text.muted}
        {...props}
      />
    </View>
  );
}
