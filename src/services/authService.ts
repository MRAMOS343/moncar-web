import { apiRequest } from "./apiClient";
import type { User } from "@/types";

export type LoginResponse = {
  token: string;
  user: User;
};

export async function loginWithPassword(email: string, password: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export async function fetchMe(token: string): Promise<{ user: User }> {
  return apiRequest<{ user: User }>("/auth/me", { token });
}
