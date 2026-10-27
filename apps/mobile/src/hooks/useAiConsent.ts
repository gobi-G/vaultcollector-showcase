import { useCallback } from "react";
import { useUpdateProfile } from "@/hooks/queries";
import { storage } from "@/utils/storage";
import { logger } from "@/utils/Logger";

const CONSENT_KEY = "ai_consent_given";

export function useAiConsent() {
  const updateProfile = useUpdateProfile();

  const isConsentGiven = useCallback((): boolean => {
    return storage.getBoolean(CONSENT_KEY) ?? false;
  }, []);

  const grantConsent = useCallback(() => {
    storage.set(CONSENT_KEY, true);
    updateProfile.mutate(
      { ai_consent_given: true, ai_consent_at: new Date().toISOString() },
      {
        onError: (e) => {
          storage.set(CONSENT_KEY, false);
          logger.error("AiConsent", "Failed to persist consent to DB", {
            error: String(e),
          });
        },
      },
    );
  }, [updateProfile]);

  const revokeConsent = useCallback(() => {
    storage.set(CONSENT_KEY, false);
    return updateProfile.mutateAsync({ ai_consent_given: false });
  }, [updateProfile]);

  return {
    isConsentGiven,
    grantConsent,
    revokeConsent,
    isRevoking: updateProfile.isPending,
  };
}
