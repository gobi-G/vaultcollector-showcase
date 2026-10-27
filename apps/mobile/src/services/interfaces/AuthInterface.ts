import type { Profile } from "@vault-collector/shared";

export type AuthUser = {
  id: string;
  email: string;
};

export type AuthSession = {
  user: AuthUser;
  accessToken: string;
};

export type SignUpParams = {
  email: string;
  password: string;
};

export type SignInParams = {
  email: string;
  password: string;
};

export interface IAuthService {
  getSession(): Promise<AuthSession | null>;
  signUp(params: SignUpParams): Promise<AuthSession | null>;
  signIn(params: SignInParams): Promise<AuthSession>;

  resetPassword(email: string): Promise<void>;
  signOut(): Promise<void>;
  deleteAccount(): Promise<void>;
  getProfile(): Promise<Profile | null>;
  updateProfile(data: Partial<Profile>): Promise<Profile>;
  onAuthStateChange(callback: (session: AuthSession | null) => void): () => void;
}
