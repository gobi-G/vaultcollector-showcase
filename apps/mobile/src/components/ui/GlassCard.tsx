import { View } from "react-native";
import type { ViewProps } from "react-native";

type GlassCardProps = ViewProps & {
  elevated?: boolean;
};

export function GlassCard({
  children,
  className = "",
  elevated = false,
  ...props
}: GlassCardProps) {
  const base = elevated
    ? "rounded-xl border border-surface-border bg-surface-elevated p-lg"
    : "rounded-lg border border-surface-border bg-surface p-lg";

  return (
    <View className={`${base} ${className}`} {...props}>
      {children}
    </View>
  );
}
