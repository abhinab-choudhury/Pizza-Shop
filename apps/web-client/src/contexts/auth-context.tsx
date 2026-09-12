"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { api } from "@/lib/api";

interface User {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  });
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window === "undefined") return true;
    return !!localStorage.getItem("access_token");
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("access_token");
    if (stored && !token) {
      setToken(stored);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    api.auth
      .getProfile(token)
      .then((res) => setUser(res.user))
      .catch(() => {
        localStorage.removeItem("access_token");
        setToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  useEffect(() => {
    const handleSessionExpired = () => {
      localStorage.removeItem("access_token");
      setToken(null);
      setUser(null);
    };

    window.addEventListener("session-expired", handleSessionExpired);
    return () => window.removeEventListener("session-expired", handleSessionExpired);
  }, []);

  useEffect(() => {
    api.setTokenRefreshedHandler((newToken) => {
      if (newToken) {
        setToken(newToken);
      } else {
        localStorage.removeItem("access_token");
        setToken(null);
        setUser(null);
      }
    });

    return () => {
      api.setTokenRefreshedHandler(null);
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.auth.login(email, password);
    localStorage.setItem("access_token", res.accessToken);
    setToken(res.accessToken);
    setUser(res.user);
  }, []);

  const register = useCallback(async (email: string, name: string, password: string) => {
    const res = await api.auth.register(email, name, password);
    localStorage.setItem("access_token", res.accessToken);
    setToken(res.accessToken);
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch {
      // Ignore errors on logout
    } finally {
      localStorage.removeItem("access_token");
      setToken(null);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
