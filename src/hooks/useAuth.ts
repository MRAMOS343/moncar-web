import { useEffect, useState } from "react";
import type { User } from "@/types";
import { logger } from "@/utils/logger";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

const LS_TOKEN_KEY = "autoparts_token";
const LS_USER_KEY = "autoparts_user";

type LoginResponse = {
  token: string;
  user: User;
  must_change_password?: boolean;
};

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Boot: si hay token, validar sesión con /auth/me
  useEffect(() => {
    const boot = async () => {
      const storedToken = localStorage.getItem(LS_TOKEN_KEY);
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      setToken(storedToken);

      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        if (!res.ok) throw new Error(`ME_FAILED_${res.status}`);

        const data = (await res.json()) as { user: User };
        setCurrentUser(data.user);
        localStorage.setItem(LS_USER_KEY, JSON.stringify(data.user));

        logger.info("Auth boot OK", { userId: data.user.id });
      } catch (err) {
        logger.warn("Auth boot failed; limpiando sesión", err);
        localStorage.removeItem(LS_TOKEN_KEY);
        localStorage.removeItem(LS_USER_KEY);
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
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) return false;

      const data = (await res.json()) as LoginResponse;

      setToken(data.token);
      setCurrentUser(data.user);

      localStorage.setItem(LS_TOKEN_KEY, data.token);
      localStorage.setItem(LS_USER_KEY, JSON.stringify(data.user));

      logger.info("Login OK", { userId: data.user.id, role: data.user.role });
      return true;
    } catch (err) {
      logger.error("Login failed", err);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem(LS_TOKEN_KEY);
    localStorage.removeItem(LS_USER_KEY);
    setToken(null);
    setCurrentUser(null);
    logger.info("Logout");
  };

  return {
    currentUser,
    token,
    isLoading,
    isAuthenticated: !!currentUser && !!token,
    login,
    logout,
  };
}
