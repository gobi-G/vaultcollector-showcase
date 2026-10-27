import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { toast } from "sonner-native";
import { useTranslation } from "react-i18next";
import * as Linking from "expo-linking";
import { supabase } from "@/services/implementations/supabase/SupabaseClient";
import { colors, fontFamily, fontSize } from "@/constants/theme";

export default function AuthCallbackScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    const handleDeepLink = async () => {
      const url = await Linking.getInitialURL();
      if (!url) {
        const { data: { session } } = await supabase.auth.getSession();
        router.replace(session ? "/(tabs)" : "/(auth)/welcome");
        return;
      }

      // Parse both query params and hash fragment
      const hashIndex = url.indexOf("#");
      const hashParams = hashIndex !== -1
        ? new URLSearchParams(url.substring(hashIndex + 1))
        : new URLSearchParams();
      const queryParams = new URL(url).searchParams;

      // Check for errors in hash (e.g. expired link)
      const error = hashParams.get("error");
      if (error) {
        router.replace("/(auth)/welcome");
        setTimeout(() => {
          toast.error(t("auth.confirmLinkExpiredTitle"), { description: t("auth.confirmLinkExpiredMessage") });
        }, 500);
        return;
      }

      // Case 1: Email confirmation with token_hash (query or hash)
      const tokenHash = queryParams.get("token_hash") ?? hashParams.get("token_hash");
      const type = queryParams.get("type") ?? hashParams.get("type");

      if (tokenHash && type) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as "email",
        });

        if (!verifyError) {
          router.replace("/(auth)/welcome");
          setTimeout(() => {
            toast.success(t("auth.emailConfirmedTitle"), { description: t("auth.emailConfirmedMessage") });
          }, 500);
          return;
        }
      }

      // Case 2: Magic link / OAuth with access_token in hash
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (!sessionError) {
          router.replace("/(tabs)");
          return;
        }
      }

      // Fallback: check if session already exists
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(auth)/welcome");
      }
    };

    handleDeepLink();
  }, [router, t]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      <Text style={{ fontFamily: fontFamily.medium, fontSize: fontSize.base, color: colors.text.muted, marginTop: 16 }}>
        Logging in...
      </Text>
    </View>
  );
}
