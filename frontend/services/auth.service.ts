import { api } from "./api";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from "@/types";

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post<{ data: AuthResponse }>("/auth/register", payload);
    return data.data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<{ data: AuthResponse }>("/auth/login", payload);
    return data.data;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },

  async refreshToken(): Promise<{ accessToken: string }> {
    const { data } = await api.post<{ data: { accessToken: string } }>("/auth/refresh-token");
    return data.data;
  },

  async me(): Promise<User> {
    const { data } = await api.get<{ data: { user: User } }>("/auth/me");
    return data.data.user;
  },

  async selectWarehouse(warehouseId: string): Promise<User> {
    const { data } = await api.patch<{ data: { user: User } }>("/users/me/warehouse", {
      warehouseId,
    });
    return data.data.user;
  },
};
