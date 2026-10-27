import * as Sentry from "@sentry/react-native";

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN ?? "";

export function initSentry() {
  if (!SENTRY_DSN) {
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.2,
    enableAutoSessionTracking: true,
    attachScreenshot: true,
    environment: process.env.EXPO_PUBLIC_APP_ENV ?? "development",
  });
}

export function captureError(error: Error, context?: Record<string, string>) {
  if (context) {
    Sentry.setContext("extra", context);
  }
  Sentry.captureException(error);
}

export function setUser(userId: string, email?: string) {
  Sentry.setUser({ id: userId, email });
}

export function clearUser() {
  Sentry.setUser(null);
}
