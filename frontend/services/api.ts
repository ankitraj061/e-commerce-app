/**
 * services/api.ts
 * Axios instance with:
 *  - Base URL from env
 *  - Access token injection via request interceptor
 *  - Automatic refresh token retry on 401
 *  - Clean error normalisation
 */

import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

// ── Base instance ─────────────────────────────────────────────────────────────

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api",
  withCredentials: true, // HttpOnly cookies (refresh token)
  timeout: 12_000,
  headers: { "Content-Type": "application/json" },
});

// ── Token store (in-memory, populated by auth store) ─────────────────────────

let _accessToken: string | null = null;
let _isRefreshing = false;
let _failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

export function setAccessToken(token: string | null) {
  _accessToken = token;
}

export function getAccessToken(): string | null {
  return _accessToken;
}

function processQueue(error: unknown, token: string | null = null) {
  _failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else if (token) prom.resolve(token);
  });
  _failedQueue = [];
}

// ── Request interceptor — inject access token ─────────────────────────────────

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (_accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${_accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Helper — clear auth hint from client storage / cookie ───────────────────
function clearAuthHint() {
  if (typeof window === "undefined") return;

  // Clear the lightweight auth hint cookie used by the proxy.
  document.cookie = "bharatbazaar-auth-hint=; path=/; max-age=0; SameSite=Lax";

  // Clear persisted auth state from Zustand storage, so refresh does not restore stale auth.
  try {
    window.localStorage.removeItem("bharatbazaar-auth");
  } catch {
    // Ignore storage errors.
  }
}

// ── Response interceptor — refresh token on 401 ───────────────────────────────

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Skip refresh for auth endpoints themselves
    const isAuthEndpoint =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/refresh-token") ||
      originalRequest.url?.includes("/auth/logout");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (_isRefreshing) {
        // Queue the request until refresh completes
        return new Promise((resolve, reject) => {
          _failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      _isRefreshing = true;

      try {
        const { data } = await api.post<{ data: { accessToken: string } }>(
          "/auth/refresh-token"
        );
        const newToken = data.data.accessToken;
        setAccessToken(newToken);
        processQueue(null, newToken);

        if (originalRequest.headers) {
          (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);
        clearAuthHint();
        // Redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
        return Promise.reject(refreshError);
      } finally {
        _isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ── Error helper ──────────────────────────────────────────────────────────────

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { error?: string; message?: string }
      | undefined;
    return data?.error ?? data?.message ?? error.message ?? "An error occurred";
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
}
