import type { Profile } from "@vault-collector/shared";
import type {
  AuthSession,
  IAuthService,
  SignInParams,
  SignUpParams,
} from "../../interfaces";
import { supabase } from "./SupabaseClient";

function mapSession(
  session: { user: { id: string; email?: string }; access_token: string } | null,
): AuthSession | null {
  if (!session) return null;
  return {
    user: { id: session.user.id, email: session.user.email ?? "" },
    accessToken: session.access_token,
  };
}

export const supabaseAuth: IAuthService = {
  async getSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return mapSession(session);
  },

  async signUp({ email, password }: SignUpParams) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "vaultcollector://auth/callback",
      },
    });
    if (error) throw error;
    return data.session ? mapSession(data.session)! : null;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "vaultcollector://auth/callback",
    });
    if (error) throw error;
  },

  async signIn({ email, password }: SignInParams) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return mapSession(data.session)!;
  },


  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async deleteAccount() {
    const { error } = await supabase.functions.invoke("delete-account");
    if (error) throw error;
    await supabase.auth.signOut();
  },

  async getProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) throw error;
    return data as Profile;
  },

  async updateProfile(updates: Partial<Profile>) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  },

  onAuthStateChange(callback: (session: AuthSession | null) => void) {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(mapSession(session));
    });
    return () => subscription.unsubscribe();
  },
};
