/**
 * VaultCollector Design System
 *
 * Inspired by dark finance/portfolio UI with glassmorphism.
 * Reference: Midnight blue dark theme with glass cards.
 */

export const colors = {
  // Backgrounds
  background: {
    primary: "#0B0F1A",
    secondary: "#0F1422",
    tertiary: "#141B2D",
  },

  // Cards & Surfaces (glassmorphism base)
  surface: {
    default: "rgba(20, 27, 45, 0.7)",
    elevated: "rgba(30, 39, 63, 0.6)",
    glass: "rgba(255, 255, 255, 0.05)",
    border: "rgba(255, 255, 255, 0.08)",
  },

  // Primary — Blue
  primary: {
    DEFAULT: "#305BF3",
    light: "#6FBAFC",
    dark: "#1E3A8A",
    muted: "rgba(48, 91, 243, 0.15)",
  },

  // Text
  text: {
    primary: "#FFFFFF",
    secondary: "#9CA3AF",
    muted: "#4E5C75",
    inverse: "#0B0F1A",
  },

  // Status
  success: {
    DEFAULT: "#22C55E",
    light: "#4ADE80",
    muted: "rgba(34, 197, 94, 0.15)",
  },
  danger: {
    DEFAULT: "#D0697B",
    light: "#F1929E",
    muted: "rgba(208, 105, 123, 0.15)",
  },
  warning: {
    DEFAULT: "#F59E0B",
    light: "#FBBF24",
    muted: "rgba(245, 158, 11, 0.15)",
  },

  // Grays
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4E5C75",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  full: 9999,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
  "5xl": 48,
} as const;

export const fontFamily = {
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semibold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
  extrabold: "PlusJakartaSans_800ExtraBold",
} as const;

export const glassmorphism = {
  card: {
    backgroundColor: colors.surface.default,
    borderColor: colors.surface.border,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
  },
  cardElevated: {
    backgroundColor: colors.surface.elevated,
    borderColor: colors.surface.border,
    borderWidth: 1,
    borderRadius: borderRadius.xl,
  },
} as const;

export const shadow = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;

const theme = {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontFamily,
  glassmorphism,
  shadow,
} as const;

export type Theme = typeof theme;
export default theme;
