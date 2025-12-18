import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@/types";
import { fetchMe, loginWithPassword } from "@/services/authService";
import { logger } from "@/utils/logger";

type AuthContextValue = {
  currentUser: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUserRole: (role: 'admin' | 'gerente' | 'cajero') => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "moncar_token";
const USER_KEY = "moncar_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Boot: cargar token y validar contra backend (/auth/me)
  useEffect(() => {
    const boot = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      setToken(storedToken);

      try {
        const me = await fetchMe(storedToken);
        setCurrentUser(me.user);
        localStorage.setItem(USER_KEY, JSON.stringify(me.user));
        logger.info("Auth boot OK", { userId: me.user.id });
      } catch (err) {
        logger.warn("Auth boot failed; limpiando sesión", err);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    boot();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const resp = await loginWithPassword(email, password);
      setToken(resp.token);
      setCurrentUser(resp.user);
      localStorage.setItem(TOKEN_KEY, resp.token);
      localStorage.setItem(USER_KEY, JSON.stringify(resp.user));
      logger.info("Login OK", { userId: resp.user.id, role: resp.user.role });
      return true;
    } catch (err) {
      logger.warn("Login failed", err);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('autoparts_warehouse');
    setToken(null);
    setCurrentUser(null);
    logger.info("Logout");
  };

  const updateUserRole = (role: 'admin' | 'gerente' | 'cajero') => {
    if (currentUser) {
      const updatedUser = { ...currentUser, role };
      setCurrentUser(updatedUser);
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      token,
      isLoading,
      isAuthenticated: !!currentUser && !!token,
      login,
      logout,
      updateUserRole,
    }),
    [currentUser, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
