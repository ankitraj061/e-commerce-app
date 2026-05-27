"use client";

import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/store/auth.store";
import { setAccessToken } from "@/services/api";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { accessToken, setHydrated } = useAuthStore();

  useEffect(() => {
    if (accessToken) {
      setAccessToken(accessToken);
    }
    setHydrated();
  }, []); 

  return <>{children}</>;
}
