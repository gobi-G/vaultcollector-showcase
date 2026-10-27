import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { authService } from "@/services";
import type { AuthSession } from "@/services/interfaces";
import { logger } from "@/utils/Logger";
import { clearUser, setUser } from "@/utils/Sentry";

type AuthContextType = {
  session: AuthSession | null;
  user: AuthSession["user"] | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authService.getSession().then((s) => {
      setSession(s);
      setIsLoading(false);
      logger.auth(s ? "Session restored" : "No session", { userId: s?.user.id });
    });

    const unsubscribe = authService.onAuthStateChange((s) => {
      setSession(s);
      logger.auth(s ? "Signed in" : "Signed out", { userId: s?.user.id });
      if (s?.user) {
        setUser(s.user.id, s.user.email);
      } else {
        clearUser();
      }
    });

    return unsubscribe;
  }, []);

  const signOut = async () => {
    logger.auth("Signing out");
    await authService.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        isLoading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
