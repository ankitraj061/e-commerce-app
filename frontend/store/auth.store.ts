/**
 * store/auth.store.ts
 * Manages authentication state, access token (in-memory), and user data.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { setAccessToken } from "@/services/api";
import type { User } from "@/types";

// Lightweight hint cookie for the proxy (middleware) to read
function setAuthHintCookie(value: boolean) {
  if (typeof document === "undefined") return;
  if (value) {
    // 7 days
    document.cookie = `bharatbazaar-auth-hint=1; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  } else {
    document.cookie = "bharatbazaar-auth-hint=; path=/; max-age=0; SameSite=Lax";
  }
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;

  // Actions
  setAuth: (user: User, accessToken: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isHydrated: false,

      setAuth: (user, accessToken) => {
        setAccessToken(accessToken);
        setAuthHintCookie(true);
        set({ user, accessToken, isAuthenticated: true });
      },

      setUser: (user) => set({ user }),

      clearAuth: () => {
        setAccessToken(null);
        setAuthHintCookie(false);
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "bharatbazaar-auth",
      storage: createJSONStorage(() => localStorage),
      // Only persist user and token; re-hydrate access token on mount
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Re-inject access token into axios on page load
          if (state.accessToken) {
            setAccessToken(state.accessToken);
          }
          state.setHydrated();
        }
      },
    }
  )
);
