import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, Text, View } from "react-native";
import { toast } from "sonner-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Check, Eye, EyeOff } from "lucide-react-native";
import { Button, Input } from "@/components/ui";
import { authService } from "@/services";
import { colors, fontFamily, fontSize, spacing } from "@/constants/theme";
import type { TFunction } from "i18next";

const AUTH_ERROR_MAP: Record<string, string> = {
  "Email not confirmed": "auth.errors.emailNotConfirmed",
  "Invalid login credentials": "auth.errors.invalidCredentials",
  "User already registered": "auth.errors.alreadyRegistered",
  "Password should be at least 6 characters": "auth.errors.passwordTooShort",
  "Unable to validate email address: invalid format": "auth.errors.invalidEmailFormat",
  "Email rate limit exceeded": "auth.errors.rateLimitExceeded",
  "For security purposes, you can only request this after": "auth.errors.rateLimitExceeded",
};

function mapAuthError(raw: string, t: TFunction): string {
  for (const [key, i18nKey] of Object.entries(AUTH_ERROR_MAP)) {
    if (raw.includes(key)) return t(i18nKey);
  }
  return t("errors.serverError");
}

export default function EmailAuthScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState(__DEV__ ? (process.env.EXPO_PUBLIC_DEV_LOGIN_EMAIL ?? "") : "");
  const [password, setPassword] = useState(__DEV__ ? (process.env.EXPO_PUBLIC_DEV_LOGIN_PASSWORD ?? "") : "");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [secureVisible, setSecureVisible] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passwordsMatch = !isSignUp || password === confirmPassword;

  const handleForgotPassword = async () => {
    if (!isValidEmail) {
      toast.error(t("common.error"), { description: t("auth.enterEmailFirst") });
      return;
    }
    setIsLoading(true);
    try {
      await authService.resetPassword(email.trim());
      toast.success(t("auth.resetEmailTitle"), { description: t("auth.resetEmailMessage") });
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      const message = mapAuthError(raw, t);
      toast.error(t("common.error"), { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!isValidEmail || !password.trim()) return;
    if (isSignUp && !passwordsMatch) {
      toast.error(t("common.error"), { description: t("auth.errors.passwordsNoMatch") });
      return;
    }
    if (isSignUp && !acceptedTerms) {
      toast.error(t("common.error"), { description: t("auth.acceptTermsRequired") });
      return;
    }
    setIsLoading(true);
    try {
      if (isSignUp) {
        await authService.signUp({ email: email.trim(), password: password.trim() });
        toast.success(t("auth.confirmEmailTitle"), { description: t("auth.confirmEmailMessage") });
        setIsSignUp(false);
        return;
      } else {
        await authService.signIn({ email: email.trim(), password: password.trim() });
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      const message = mapAuthError(raw, t);
      toast.error(t("common.error"), { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, paddingHorizontal: spacing["2xl"], paddingTop: spacing["2xl"] }}>
          {/* Back Button */}
          <Pressable
            testID="email-back-btn"
            onPress={() => router.back()}
            accessibilityLabel={t("common.back")}
            style={{ marginBottom: spacing["3xl"] }}
          >
            <Text style={{ fontFamily: fontFamily.medium, fontSize: fontSize.lg, color: colors.primary.light }}>
              {t("common.back")}
            </Text>
          </Pressable>

          {/* Title */}
          <Text
            testID="email-title"
            style={{
              fontFamily: fontFamily.bold,
              fontSize: fontSize["3xl"],
              color: colors.text.primary,
              marginBottom: spacing.sm,
            }}
          >
            {isSignUp ? t("auth.createAccount") : t("auth.welcomeBack")}
          </Text>

          <Text
            style={{
              fontFamily: fontFamily.regular,
              fontSize: fontSize.lg,
              color: colors.text.muted,
              marginBottom: spacing["3xl"],
            }}
          >
            {t("auth.enterEmail")}
          </Text>

          {/* Email Input */}
          <Input
            testID="email-input"
            value={email}
            onChangeText={setEmail}
            placeholder={t("auth.emailPlaceholder")}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            accessibilityLabel={t("auth.emailPlaceholder")}
          />
          {email.length > 0 && !isValidEmail && (
            <Text
              testID="email-error"
              style={{
                fontFamily: fontFamily.regular,
                fontSize: fontSize.xs,
                color: colors.danger.DEFAULT,
                marginTop: spacing.xs,
              }}
            >
              {t("auth.invalidEmail")}
            </Text>
          )}

          {/* Password Input */}
          <View style={{ marginTop: spacing.md, position: "relative" }}>
            <Input
              testID="email-password-input"
              value={password}
              onChangeText={setPassword}
              placeholder={t("auth.passwordPlaceholder")}
              secureTextEntry={secureVisible}
              autoComplete="password"
              accessibilityLabel={t("auth.passwordPlaceholder")}
            />
            <Pressable
              testID="email-password-eye"
              onPress={() => setSecureVisible(!secureVisible)}
              accessibilityLabel={secureVisible ? "Show password" : "Hide password"}
              style={{ position: "absolute", right: spacing.md, top: 0, bottom: 0, justifyContent: "center" }}
            >
              {secureVisible ? (
                <EyeOff size={20} color={colors.text.muted} />
              ) : (
                <Eye size={20} color={colors.text.muted} />
              )}
            </Pressable>
          </View>

          {/* Confirm Password (Sign Up only) */}
          {isSignUp && (
            <View style={{ marginTop: spacing.md }}>
              <Input
                testID="email-confirm-password-input"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder={t("auth.confirmPasswordPlaceholder")}
                secureTextEntry
                autoComplete="password"
                accessibilityLabel={t("auth.confirmPasswordPlaceholder")}
              />
              {confirmPassword.length > 0 && !passwordsMatch && (
                <Text style={{
                  fontFamily: fontFamily.regular, fontSize: fontSize.xs,
                  color: colors.danger.DEFAULT, marginTop: spacing.xs,
                }}>
                  {t("auth.errors.passwordsNoMatch")}
                </Text>
              )}
            </View>
          )}

          {/* Terms Checkbox (Sign Up only) */}
          {isSignUp && (
            <Pressable
              testID="email-terms-checkbox"
              onPress={() => setAcceptedTerms(!acceptedTerms)}
              accessibilityLabel={t("auth.acceptTerms")}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: acceptedTerms }}
              style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.lg }}
            >
              <View style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                borderWidth: 2,
                borderColor: acceptedTerms ? colors.primary.DEFAULT : colors.surface.border,
                backgroundColor: acceptedTerms ? colors.primary.DEFAULT : "transparent",
                alignItems: "center",
                justifyContent: "center",
              }}>
                {acceptedTerms && <Check size={14} color={colors.text.primary} />}
              </View>
              <Text style={{ flex: 1, fontFamily: fontFamily.regular, fontSize: fontSize.xs, color: colors.text.muted }}>
                {t("auth.acceptTerms")}
              </Text>
            </Pressable>
          )}

          {/* Forgot Password (Sign In only) */}
          {!isSignUp && (
            <Pressable
              testID="email-forgot-password"
              onPress={handleForgotPassword}
              disabled={isLoading}
              style={{ marginTop: spacing.sm, alignSelf: "flex-end" }}
              accessibilityLabel={t("auth.forgotPassword")}
            >
              <Text style={{ fontFamily: fontFamily.medium, fontSize: fontSize.xs, color: colors.primary.light }}>
                {t("auth.forgotPassword")}
              </Text>
            </Pressable>
          )}

          {/* Submit Button */}
          <Button
            testID="email-submit-btn"
            label={isLoading
              ? t("common.loading")
              : isSignUp
                ? t("auth.signUp")
                : t("auth.signIn")}
            variant="primary"
            size="lg"
            onPress={handleSubmit}
            disabled={isLoading || !isValidEmail || !password.trim() || (isSignUp && !passwordsMatch) || (isSignUp && !acceptedTerms)}
            style={{ marginTop: spacing.lg, width: "100%" }}
            accessibilityLabel={isSignUp ? t("auth.signUp") : t("auth.signIn")}
          />

          {/* Toggle Sign Up / Sign In */}
          <Pressable
            testID="email-toggle-mode"
            onPress={() => setIsSignUp(!isSignUp)}
            style={{ marginTop: spacing.lg, alignItems: "center" }}
            accessibilityLabel={isSignUp ? t("auth.hasAccount") : t("auth.noAccount")}
          >
            <Text style={{ fontFamily: fontFamily.regular, fontSize: fontSize.sm, color: colors.primary.light }}>
              {isSignUp ? t("auth.hasAccount") : t("auth.noAccount")}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
