"use client";

import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/store/auth.store";
import { setAccessToken } from "@/services/api";

/**
 * AuthProvider — re-hydrates access token from persisted store on mount.
 * Must wrap the entire app so axios has the token before any requests fire.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { accessToken, setHydrated } = useAuthStore();

  useEffect(() => {
    if (accessToken) {
      setAccessToken(accessToken);
    }
    setHydrated();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
