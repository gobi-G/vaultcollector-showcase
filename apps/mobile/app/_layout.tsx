import "../global.css";

import { initSentry } from "@/utils/Sentry";
import { Slot, useRouter, useSegments } from "expo-router";

initSentry();
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Keyboard, TouchableWithoutFeedback } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/plus-jakarta-sans";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Toaster } from "sonner-native";
import { AnimatedSplash, ErrorBoundary, OfflineBanner } from "@/components/ui";
import { colors, fontFamily } from "@/constants/theme";
import { AuthProvider, PurchaseProvider, QueryProvider, ThemeProvider } from "@/providers";
import { useAuth } from "@/providers/AuthProvider";
import "@/i18n";

const ONBOARDING_KEY = "hasSeenOnboarding";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((value) => {
      setHasSeenOnboarding(value === "true");
    });
  }, [segments]);

  useEffect(() => {
    if (isLoading || hasSeenOnboarding === null) return;

    const timeout = setTimeout(() => {
      const inAuthGroup = segments[0] === "(auth)";
      const inOnboarding = segments[0] === "onboarding";
      const inStandalone = segments[0] === "legal" || segments[0] === "paywall" || segments[0] === "vault";

      if (!hasSeenOnboarding && !inOnboarding) {
        router.replace("/onboarding");
      } else if (hasSeenOnboarding && !session && !inAuthGroup && !inOnboarding && !inStandalone) {
        router.replace("/(auth)/welcome");
      } else if (session && (inAuthGroup || inOnboarding)) {
        AsyncStorage.setItem(ONBOARDING_KEY, "true");
        setHasSeenOnboarding(true);
        router.replace("/(tabs)");
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, [session, isLoading, segments, router, hasSeenOnboarding]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <ErrorBoundary>
        <AnimatedSplash isReady={fontsLoaded}>
          <QueryProvider>
            <AuthProvider>
              <PurchaseProvider>
                <ThemeProvider>
                  <AuthGuard>
                    <OfflineBanner />
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                      <Slot />
                    </TouchableWithoutFeedback>
                  </AuthGuard>
                <Toaster
                theme="dark"
                position="top-center"
                toastOptions={{
                  style: {
                    backgroundColor: colors.background.tertiary,
                    borderColor: colors.surface.border,
                    borderWidth: 1,
                  },
                  titleStyle: {
                    fontFamily: fontFamily.semibold,
                    color: colors.text.primary,
                  },
                  descriptionStyle: {
                    fontFamily: fontFamily.regular,
                    color: colors.text.muted,
                  },
                }}
              />
                <StatusBar style="light" />
                </ThemeProvider>
              </PurchaseProvider>
            </AuthProvider>
          </QueryProvider>
        </AnimatedSplash>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
