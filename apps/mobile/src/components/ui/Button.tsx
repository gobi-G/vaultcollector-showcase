import { Pressable, Text } from "react-native";
import type { PressableProps } from "react-native";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = PressableProps & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantStyles: Record<ButtonVariant, { container: string; text: string }> = {
  primary: {
    container: "bg-primary",
    text: "text-text-primary font-sans-semibold",
  },
  secondary: {
    container: "bg-primary-muted",
    text: "text-primary-light font-sans-semibold",
  },
  outline: {
    container: "border border-surface-border bg-transparent",
    text: "text-text-primary font-sans-semibold",
  },
  ghost: {
    container: "bg-transparent",
    text: "text-text-secondary font-sans-medium",
  },
  danger: {
    container: "bg-danger-muted",
    text: "text-danger-light font-sans-semibold",
  },
};

const sizeStyles: Record<ButtonSize, { container: string; text: string }> = {
  sm: { container: "px-md py-sm rounded-sm", text: "text-sm" },
  md: { container: "px-lg py-md rounded-md", text: "text-base" },
  lg: { container: "px-xl py-lg rounded-lg", text: "text-lg" },
};

export function Button({
  label,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const v = variantStyles[variant];
  const s = sizeStyles[size];

  return (
    <Pressable
      className={`items-center justify-center ${v.container} ${s.container} ${className}`}
      {...props}
    >
      <Text className={`${v.text} ${s.text}`}>{label}</Text>
    </Pressable>
  );
}
