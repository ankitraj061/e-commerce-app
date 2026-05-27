"use client";

import { type ReactNode } from "react";
import { QueryProvider } from "./query-provider";
import { AuthProvider } from "./auth-provider";
import { Toaster } from "sonner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        {children}
        <Toaster
          position="top-right"
          theme="light"
          richColors
          gap={8}
          toastOptions={{
            style: {
              background: "#ffffff",
              border: "1px solid rgba(0,0,0,0.07)",
              color: "#111827",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
              borderRadius: "14px",
              fontSize: "0.875rem",
              fontFamily: "inherit",
              padding: "14px 16px",
            },
          }}
        />
      </AuthProvider>
    </QueryProvider>
  );
}
