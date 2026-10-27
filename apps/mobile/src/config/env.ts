type AppEnv = "development" | "production" | "staging";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const APP_ENV = (process.env.EXPO_PUBLIC_APP_ENV as AppEnv) ?? "development";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    `Missing Supabase environment variables. Check your .env.${APP_ENV} file.`,
  );
}

export const env = {
  supabaseUrl: SUPABASE_URL,
  supabaseAnonKey: SUPABASE_ANON_KEY,
  appEnv: APP_ENV,
  isDev: APP_ENV === "development",
  isProd: APP_ENV === "production",
} as const;
