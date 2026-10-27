import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";
import { useColorScheme, View } from "react-native";
import { vars } from "nativewind";

type ThemeMode = "light" | "dark" | "system";

type ThemeContextType = {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

const darkTheme = vars({
  "--color-bg-primary": "#0B0F1A",
  "--color-bg-secondary": "#0F1422",
  "--color-bg-tertiary": "#141B2D",
  "--color-surface": "rgba(20, 27, 45, 0.7)",
  "--color-surface-elevated": "rgba(30, 39, 63, 0.6)",
  "--color-surface-glass": "rgba(255, 255, 255, 0.05)",
  "--color-surface-border": "rgba(255, 255, 255, 0.08)",
  "--color-text-primary": "#FFFFFF",
  "--color-text-secondary": "#9CA3AF",
  "--color-text-muted": "#4E5C75",
});

const lightTheme = vars({
  "--color-bg-primary": "#F8FAFC",
  "--color-bg-secondary": "#F1F5F9",
  "--color-bg-tertiary": "#E2E8F0",
  "--color-surface": "rgba(255, 255, 255, 0.9)",
  "--color-surface-elevated": "rgba(255, 255, 255, 0.95)",
  "--color-surface-glass": "rgba(0, 0, 0, 0.03)",
  "--color-surface-border": "rgba(0, 0, 0, 0.08)",
  "--color-text-primary": "#0F172A",
  "--color-text-secondary": "#475569",
  "--color-text-muted": "#94A3B8",
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>("dark");

  const isDark = mode === "system" ? systemColorScheme === "dark" : mode === "dark";

  const toggle = useCallback(() => {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const themeStyles = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ mode, isDark, setMode, toggle }}>
      <View style={themeStyles} className="flex-1">
        {children}
      </View>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
