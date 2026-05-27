
import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api",
  withCredentials: true, 
  timeout: 12_000,
  headers: { "Content-Type": "application/json" },
});

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

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (_accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${_accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

function clearAuthHint() {
  if (typeof window === "undefined") return;

  
  document.cookie = "bharatbazaar-auth-hint=; path=/; max-age=0; SameSite=Lax";

  
  try {
    window.localStorage.removeItem("bharatbazaar-auth");
  } catch {
    
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    
    const isAuthEndpoint =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/refresh-token") ||
      originalRequest.url?.includes("/auth/logout");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (_isRefreshing) {
        
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
