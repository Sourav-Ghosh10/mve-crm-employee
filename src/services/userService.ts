import api from "./api";
import type { User, UserFilters, BackendUser } from "../types/user.types";
import { mapUserResponse, mapUserRequest } from "../types/user.types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const userService = {
  getAll: async (params?: UserFilters) => {
    // Depending on the backend, this might return wraped data or raw array
    // Let's assume it returns { success, data: User[] } based on User's snippet
    const response = await api.get<ApiResponse<BackendUser[]> | BackendUser[]>("/users", { params });
    const users = (response.data as ApiResponse<BackendUser[]>).data || response.data;
    if (Array.isArray(users)) {
      return users.map((u: BackendUser) => mapUserResponse(u));
    }
    return [];
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<BackendUser> | BackendUser>(`/users/${id}`);
    const userData = (response.data as ApiResponse<BackendUser>).data || response.data;
    return mapUserResponse(userData as BackendUser);
  },

  create: async (data: Omit<User, "id">) => {
    const payload = mapUserRequest(data);
    const response = await api.post<ApiResponse<BackendUser> | BackendUser>("/users", payload);
    const userData = (response.data as ApiResponse<BackendUser>).data || response.data;
    return mapUserResponse(userData as BackendUser);
  },

  update: async (id: string, data: Partial<User>, config?: any) => {
    const payload = mapUserRequest(data);
    const response = await api.put<ApiResponse<BackendUser> | BackendUser>(`/users/${id}`, payload, config);
    const userData = (response.data as ApiResponse<BackendUser>).data || response.data;
    return mapUserResponse(userData as BackendUser);
  },

  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};
