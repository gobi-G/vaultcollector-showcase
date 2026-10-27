import { useState } from "react";
import { ActivityIndicator, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import { toast } from "sonner-native";
import {
  Brain,
  Crown,
  Download,
  Edit3,
  FileText,
  Globe,
  Info,
  Lock,
  LogOut,
  MessageCircle,
  Shield,
  Trash2,
  User,
} from "lucide-react-native";
import { ConfirmSheet, ErrorView, GlassCard } from "@/components/ui";
import { EditNameModal, LanguagePicker, SettingsRow } from "@/components/features";
import { LEGAL_OPERATOR } from "@/constants/legalDocs";
import { colors, spacing } from "@/constants/theme";
import {
  useAllUserItems,
  useProfile,
  useScanUsage,
  useUpdateProfile,
} from "@/hooks/queries";
import { useAiConsent } from "@/hooks/useAiConsent";
import { useAuth } from "@/providers/AuthProvider";
import { authService } from "@/services";
import { exportItemsToCsv } from "@/utils/csvExport";
import { logger } from "@/utils/Logger";

const ITEM_LIMITS: Record<string, number> = {
  free: 50,
  premium: 500,
  pro: 999999,
};

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const profileQuery = useProfile();
  const { data: profile, isLoading } = profileQuery;
  const { data: allItems } = useAllUserItems();
  const currentItemCount = allItems?.length ?? 0;
  const updateProfile = useUpdateProfile();
  const [showNameModal, setShowNameModal] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showRevokeConsent, setShowRevokeConsent] = useState(false);
  const { revokeConsent, isRevoking } = useAiConsent();
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSaveName = (name: string) => {
    if (!name) return;
    updateProfile.mutate(
      { display_name: name },
      {
        onSuccess: () => {
          toast.success(t("profile.nameUpdated"));
          setShowNameModal(false);
        },
        onError: () => toast.error(t("common.error")),
      },
    );
  };

  const handleCsvExport = async () => {
    if (!allItems || allItems.length === 0) {
      toast.error(t("profile.noItemsToExport"));
      return;
    }
    if (tier === "free") {
      router.push("/paywall");
      return;
    }
    try {
      await exportItemsToCsv(allItems);
      toast.success(t("profile.exportSuccess"));
    } catch {
      toast.error(t("common.error"));
    }
  };

  // DEV ONLY — Token für Benchmark, danach entfernen
  const handleCopyToken = async () => {
    const session = await authService.getSession();
    if (session?.accessToken) {
      logger.info("DEV", "=== ACCESS TOKEN ===", { token: session.accessToken });
      toast.success("Token in Metro Console geloggt");
    } else {
      toast.error("Kein Token gefunden");
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch {
      toast.error(t("common.error"));
    } finally {
      setIsLoggingOut(false);
      setShowLogout(false);
    }
  };

  const handleRevokeConsent = async () => {
    try {
      await revokeConsent();
      toast.success(t("profile.aiConsentRevoked"));
    } catch {
      toast.error(t("common.error"));
    } finally {
      setShowRevokeConsent(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await authService.deleteAccount();
      toast.success(t("profile.accountDeleted"));
    } catch (error) {
      logger.error("Profile", "Delete account failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      toast.error(t("common.error"));
      setIsDeletingAccount(false);
      setShowDeleteAccount(false);
    }
  };

  const handleFeedback = async () => {
    const version = Constants.expoConfig?.version ?? "1.0.0";
    const subject = encodeURIComponent("VaultCollector Feedback");
    const body = encodeURIComponent(`\n\n---\nApp: v${version}`);
    try {
      await Linking.openURL(`mailto:${LEGAL_OPERATOR.email}?subject=${subject}&body=${body}`);
    } catch {
      toast.error(t("common.error"));
    }
  };

  const tier = profile?.subscription_tier ?? "free";
  const maxItems = ITEM_LIMITS[tier] ?? 50;
  const displayName = profile?.display_name ?? user?.email?.split("@")[0] ?? "Collector";
  const scanUsage = useScanUsage();
  const languageMap: Record<string, string> = {
    en: "English",
    de: "Deutsch",
    fr: "Français",
    es: "Español",
  };

  return (
    <SafeAreaView
      testID="tabs-profile"
      style={{ flex: 1, backgroundColor: colors.background.primary }}
      edges={["top"]}
    >
      {/* Fixed Header */}
      <Text
        style={{
          fontFamily: "PlusJakartaSans_700Bold",
          fontSize: 24,
          color: colors.text.primary,
          paddingTop: spacing.md,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.sm,
        }}
      >
        {t("profile.title")}
      </Text>

      {profileQuery.isError && <ErrorView onRetry={() => profileQuery.refetch()} />}

      <ScrollView
        style={{ flex: 1, paddingHorizontal: spacing.lg }}
        contentContainerStyle={{ paddingBottom: 160 }}
      >
        {/* User Card */}
        {isLoading ? (
          <GlassCard elevated className="mt-xl items-center">
            <ActivityIndicator color={colors.primary.DEFAULT} />
          </GlassCard>
        ) : (
          <GlassCard elevated className="mt-xl items-center">
            <View className="h-[64px] w-[64px] items-center justify-center rounded-full bg-primary-muted">
              <User size={32} color={colors.primary.light} />
            </View>
            <Pressable
              testID="profile-edit-name"
              onPress={() => setShowNameModal(true)}
              accessibilityLabel={t("profile.editName")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginTop: spacing.md,
              }}
            >
              <Text
                testID="profile-name"
                className="font-sans-bold text-xl text-text-primary"
              >
                {displayName}
              </Text>
              <Edit3 size={14} color={colors.text.muted} />
            </Pressable>
            <Text testID="profile-email" className="font-sans text-sm text-text-muted">
              {user?.email}
            </Text>
            <Text className="mt-xs font-sans text-xs text-text-muted">
              {t("profile.itemLimit", { current: currentItemCount, max: maxItems })}
            </Text>
            <View className="mt-md w-full rounded-full bg-bg-tertiary">
              <View
                className="h-[6px] rounded-full bg-primary"
                style={{
                  width: `${Math.min((currentItemCount / maxItems) * 100, 100)}%`,
                }}
              />
            </View>
            {!scanUsage.isUnlimited ? (
              <>
                <Text className="mt-md font-sans text-xs text-text-muted">
                  {t("profile.scanUsage", { used: scanUsage.used, max: scanUsage.limit })}
                </Text>
                <View className="mt-xs w-full rounded-full bg-bg-tertiary">
                  <View
                    className="h-[6px] rounded-full bg-warning"
                    style={{
                      width: `${Math.min((scanUsage.used / scanUsage.limit) * 100, 100)}%`,
                    }}
                  />
                </View>
              </>
            ) : null}
          </GlassCard>
        )}

        {/* Subscription */}
        <GlassCard className="mt-lg flex-row items-center justify-between">
          <View className="flex-row items-center gap-md">
            <View className="h-[44px] w-[44px] items-center justify-center rounded-lg bg-warning-muted">
              <Crown size={22} color={colors.warning.DEFAULT} />
            </View>
            <View>
              <Text className="font-sans-semibold text-base text-text-primary">
                {t("profile.subscription")}
              </Text>
              <Text testID="profile-tier" className="font-sans text-xs text-text-muted">
                {t(`profile.${tier}`)}
              </Text>
            </View>
          </View>
          <Pressable
            testID="profile-upgrade-btn"
            onPress={() => router.push("/paywall")}
            className="rounded-md bg-primary px-lg py-sm"
            accessibilityLabel={
              tier === "pro" ? t("profile.managePlan") : t("profile.upgrade")
            }
          >
            <Text className="font-sans-semibold text-sm text-text-primary">
              {tier === "pro"
                ? t("profile.managePlan")
                : tier === "premium"
                  ? t("profile.upgradeToPro")
                  : t("profile.upgrade")}
            </Text>
          </Pressable>
        </GlassCard>

        {/* Vault */}
        <Pressable
          testID="profile-vault-btn"
          onPress={() => router.push("/vault")}
          accessibilityLabel={t("vault.title")}
        >
          <GlassCard className="mt-lg flex-row items-center gap-md">
            <View className="h-[44px] w-[44px] items-center justify-center rounded-lg bg-primary-muted">
              <Lock size={22} color={colors.primary.light} />
            </View>
            <View style={{ flex: 1 }}>
              <Text className="font-sans-semibold text-base text-text-primary">
                {t("vault.title")}
              </Text>
              <Text className="font-sans text-xs text-text-muted">
                {t("vault.subtitle")}
              </Text>
            </View>
          </GlassCard>
        </Pressable>

        {/* CSV Export */}
        <Pressable
          testID="profile-csv-export-btn"
          onPress={handleCsvExport}
          accessibilityLabel={t("profile.exportCsv")}
        >
          <GlassCard className="mt-lg flex-row items-center gap-md">
            <View className="h-[44px] w-[44px] items-center justify-center rounded-lg bg-success-muted">
              <Download size={22} color={colors.success.DEFAULT} />
            </View>
            <View style={{ flex: 1 }}>
              <Text className="font-sans-semibold text-base text-text-primary">
                {t("profile.exportCsv")}
              </Text>
              <Text className="font-sans text-xs text-text-muted">
                {t("profile.exportCsvDesc")}
              </Text>
            </View>
          </GlassCard>
        </Pressable>

        {/* Settings */}
        <GlassCard className="mt-lg">
          <SettingsRow
            testID="profile-language-btn"
            icon={<Globe size={20} color={colors.text.secondary} />}
            label={t("profile.language")}
            value={languageMap[i18n.language] ?? i18n.language}
            onPress={() => setShowLanguagePicker(true)}
          />
          <View className="border-b border-surface-border" />
          <SettingsRow
            testID="profile-about-btn"
            icon={<Info size={20} color={colors.text.secondary} />}
            label={t("profile.about")}
            value={`v${Constants.expoConfig?.version ?? "1.0.0"}`}
          />
          <View className="border-b border-surface-border" />
          {/* DEV ONLY — danach entfernen */}
          <SettingsRow
            testID="profile-dev-token-btn"
            icon={<Info size={20} color={colors.text.secondary} />}
            label="[DEV] Token loggen"
            onPress={handleCopyToken}
          />
          <View className="border-b border-surface-border" />
          <SettingsRow
            testID="profile-benchmark-btn"
            icon={<Info size={20} color={colors.text.secondary} />}
            label="[DEV] AI Scan Benchmark"
            onPress={() => router.push("/benchmark")}
          />
          <View className="border-b border-surface-border" />
          <SettingsRow
            testID="profile-logout-btn"
            icon={<LogOut size={20} color={colors.danger.DEFAULT} />}
            label={t("profile.logout")}
            danger
            onPress={() => setShowLogout(true)}
          />
          <View className="border-b border-surface-border" />
          <SettingsRow
            testID="profile-delete-account-btn"
            icon={<Trash2 size={20} color={colors.danger.DEFAULT} />}
            label={t("profile.deleteAccount")}
            danger
            onPress={() => setShowDeleteAccount(true)}
          />
        </GlassCard>

        {/* Legal */}
        <GlassCard className="mt-lg">
          <SettingsRow
            testID="profile-privacy-btn"
            icon={<Shield size={20} color={colors.text.secondary} />}
            label={t("legal.privacyPolicy")}
            onPress={() => router.push("/legal?type=privacyPolicy")}
          />
          <View className="border-b border-surface-border" />
          {profile?.ai_consent_given === true && (
            <>
              <SettingsRow
                testID="profile-revoke-consent-btn"
                icon={<Brain size={20} color={colors.text.secondary} />}
                label={t("profile.revokeAiConsent")}
                onPress={() => setShowRevokeConsent(true)}
              />
              <View className="border-b border-surface-border" />
            </>
          )}
          <SettingsRow
            testID="profile-terms-btn"
            icon={<FileText size={20} color={colors.text.secondary} />}
            label={t("legal.termsOfService")}
            onPress={() => router.push("/legal?type=termsOfService")}
          />
          <View className="border-b border-surface-border" />
          <SettingsRow
            testID="profile-impressum-btn"
            icon={<FileText size={20} color={colors.text.secondary} />}
            label={t("legal.impressum")}
            onPress={() => router.push("/legal?type=impressum")}
          />
          <View className="border-b border-surface-border" />
          <SettingsRow
            testID="profile-feedback-btn"
            icon={<MessageCircle size={20} color={colors.text.secondary} />}
            label={t("profile.feedback")}
            onPress={handleFeedback}
          />
        </GlassCard>
      </ScrollView>

      <EditNameModal
        visible={showNameModal}
        initialName={profile?.display_name ?? ""}
        isLoading={updateProfile.isPending}
        onSave={handleSaveName}
        onClose={() => setShowNameModal(false)}
      />

      <LanguagePicker
        visible={showLanguagePicker}
        onClose={() => setShowLanguagePicker(false)}
      />

      <ConfirmSheet
        visible={showDeleteAccount}
        title={t("profile.deleteAccountTitle")}
        message={t("profile.deleteAccountMessage")}
        confirmLabel={t("profile.deleteAccount")}
        destructive
        isLoading={isDeletingAccount}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteAccount(false)}
      />

      <ConfirmSheet
        visible={showLogout}
        title={t("profile.logoutTitle")}
        message={t("profile.logoutMessage")}
        confirmLabel={t("profile.logout")}
        destructive
        isLoading={isLoggingOut}
        onConfirm={handleLogout}
        onCancel={() => setShowLogout(false)}
      />

      <ConfirmSheet
        visible={showRevokeConsent}
        title={t("profile.revokeAiConsentTitle")}
        message={t("profile.revokeAiConsentMessage")}
        confirmLabel={t("profile.revokeAiConsentConfirm")}
        destructive
        isLoading={isRevoking}
        onConfirm={handleRevokeConsent}
        onCancel={() => setShowRevokeConsent(false)}
      />
    </SafeAreaView>
  );
}
