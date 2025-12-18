import { useState, useEffect } from "react";
import { User } from "../types";
import { userSchema } from "@/schemas/userSchema";
import { logger } from "@/utils/logger";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

const LS_USER_KEY = "autoparts_user";
const LS_TOKEN_KEY = "autoparts_token";

type LoginResponse = {
  token: string;
  user: User;
};

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Boot: si hay token, validarlo con /auth/me
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
        const parsed = userSchema.safeParse(data.user);

        if (!parsed.success) throw new Error("ME_USER_INVALID_SCHEMA");

        setCurrentUser(parsed.data as User);
        localStorage.setItem(LS_USER_KEY, JSON.stringify(parsed.data));
        logger.info("Auth boot OK", { userId: parsed.data.id });
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

      const parsed = userSchema.safeParse(data.user);
      if (!parsed.success) {
        logger.warn("Login: user inválido según schema", parsed.error.errors);
        return false;
      }

      setToken(data.token);
      setCurrentUser(parsed.data as User);

      localStorage.setItem(LS_TOKEN_KEY, data.token);
      localStorage.setItem(LS_USER_KEY, JSON.stringify(parsed.data));

      logger.info("Login OK", { userId: parsed.data.id, role: parsed.data.role });
      return true;
    } catch (err) {
      logger.error("Login failed", err);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem(LS_TOKEN_KEY);
    localStorage.removeItem(LS_USER_KEY);
    localStorage.removeItem("autoparts_warehouse");
    setToken(null);
    setCurrentUser(null);
  };

  return {
    currentUser,
    token,
    isLoading,
    login,
    logout,
    isAuthenticated: !!currentUser && !!token,
  };
}
