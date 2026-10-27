type AppEnv = "development" | "production" | "staging";

const APP_ENV = (Deno.env.get("APP_ENV") as AppEnv) ?? "development";

export const env = {
  supabaseUrl: Deno.env.get("SUPABASE_URL") ?? "",
  supabaseServiceKey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  pokemonTcgApiKey: Deno.env.get("POKEMON_TCG_API_KEY") ?? "",
  openaiApiKey: Deno.env.get("OPENAI_API_KEY") ?? "",
  appEnv: APP_ENV,
  isDev: APP_ENV === "development",
  isProd: APP_ENV === "production",
} as const;
