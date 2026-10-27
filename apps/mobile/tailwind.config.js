/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        bg: {
          primary: "#0B0F1A",
          secondary: "#0F1422",
          tertiary: "#141B2D",
        },
        // Surfaces / Cards
        surface: {
          DEFAULT: "rgba(20, 27, 45, 0.7)",
          elevated: "rgba(30, 39, 63, 0.6)",
          glass: "rgba(255, 255, 255, 0.05)",
          border: "rgba(255, 255, 255, 0.08)",
        },
        // Primary Blue
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
      },
      fontFamily: {
        sans: ["PlusJakartaSans_400Regular"],
        "sans-medium": ["PlusJakartaSans_500Medium"],
        "sans-semibold": ["PlusJakartaSans_600SemiBold"],
        "sans-bold": ["PlusJakartaSans_700Bold"],
        "sans-extrabold": ["PlusJakartaSans_800ExtraBold"],
      },
      fontSize: {
        xs: ["11px", { lineHeight: "16px" }],
        sm: ["13px", { lineHeight: "18px" }],
        base: ["15px", { lineHeight: "22px" }],
        lg: ["17px", { lineHeight: "24px" }],
        xl: ["20px", { lineHeight: "28px" }],
        "2xl": ["24px", { lineHeight: "32px" }],
        "3xl": ["30px", { lineHeight: "38px" }],
        "4xl": ["36px", { lineHeight: "44px" }],
        "5xl": ["48px", { lineHeight: "56px" }],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
        "4xl": "40px",
        "5xl": "48px",
      },
    },
  },
  plugins: [],
};
