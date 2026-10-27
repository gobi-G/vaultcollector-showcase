import { Text, View } from "react-native";

type BadgeVariant = "default" | "success" | "danger" | "warning" | "primary";

type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
  className?: string;
};

const variantStyles: Record<BadgeVariant, { container: string; text: string }> = {
  default: {
    container: "bg-surface-glass",
    text: "text-text-secondary",
  },
  success: {
    container: "bg-success-muted",
    text: "text-success-light",
  },
  danger: {
    container: "bg-danger-muted",
    text: "text-danger-light",
  },
  warning: {
    container: "bg-warning-muted",
    text: "text-warning-light",
  },
  primary: {
    container: "bg-primary-muted",
    text: "text-primary-light",
  },
};

export function Badge({ label, variant = "default", className = "" }: BadgeProps) {
  const v = variantStyles[variant];

  return (
    <View className={`rounded-full px-md py-xs ${v.container} ${className}`}>
      <Text className={`font-sans-medium text-xs ${v.text}`}>{label}</Text>
    </View>
  );
}
