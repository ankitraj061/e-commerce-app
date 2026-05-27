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
          toastOptions={{
            style: {
              background: "rgba(15, 15, 19, 0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fafafa",
              backdropFilter: "blur(16px)",
            },
            className: "glass",
          }}
          richColors
        />
      </AuthProvider>
    </QueryProvider>
  );
}
