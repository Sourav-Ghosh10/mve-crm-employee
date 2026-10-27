import api from "./api";
import type { User, UserFilters, BackendUser, PaginatedUserResponse } from "../types/user.types";
import { mapUserResponse, mapUserRequest } from "../types/user.types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

const normalizeUser = (u: any): User => {
  if (!u) return u;
  const id = typeof u._id === "object" && u._id?.$oid ? u._id.$oid : (u._id || u.id || "");
  const mapped = mapUserResponse(u);
  return {
    ...u,
    ...mapped,
    id,
    _id: id,
    personalInfo: u.personalInfo || {
      firstName: mapped.firstName,
      lastName: mapped.lastName,
      email: mapped.email,
      phone: mapped.phone,
      dateOfBirth: mapped.dateOfBirth,
      panNumber: mapped.panNumber,
      address: mapped.address,
      emergencyContact: mapped.emergencyContact,
    },
    employment: u.employment || {
      role: mapped.role,
      department: mapped.department,
      designation: mapped.designation,
      dateOfJoining: mapped.joinDate,
      location: mapped.location,
      timezone: mapped.timezone,
      workingHours: mapped.workingHours,
    },
    isActive: u.isActive !== undefined ? Boolean(u.isActive) : mapped.status === "active",
  };
};

export const userService = {
  getAll: async (params?: UserFilters): Promise<PaginatedUserResponse> => {
    const response = await api.get<any>("/users", { params });
    const resData = response.data?.data || response.data;
    let userList: User[] = [];
    let total = 0;
    let page = params?.page || 1;
    let limit = params?.limit || 10;
    let totalPages = 1;

    if (Array.isArray(resData)) {
      userList = resData.map(normalizeUser);
      total = response.data?.pagination?.total ?? response.data?.total ?? userList.length;
      totalPages = response.data?.pagination?.pages ?? response.data?.totalPages ?? 1;
      page = response.data?.pagination?.page ?? page;
      limit = response.data?.pagination?.limit ?? limit;
    } else if (resData && typeof resData === "object") {
      const rawList = resData.users || resData.data || [];
      if (Array.isArray(rawList)) {
        userList = rawList.map(normalizeUser);
      }
      total = resData.total ?? response.data?.total ?? response.data?.pagination?.total ?? userList.length;
      totalPages = resData.totalPages ?? resData.pages ?? response.data?.totalPages ?? response.data?.pagination?.pages ?? 1;
      page = resData.page ?? response.data?.page ?? response.data?.pagination?.page ?? page;
      limit = resData.limit ?? response.data?.limit ?? response.data?.pagination?.limit ?? limit;
    }

    const result = Object.assign([...userList], {
      users: userList,
      total,
      totalPages,
      page,
      limit,
    }) as PaginatedUserResponse & User[];
    return result;
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get<ApiResponse<BackendUser> | BackendUser>(`/users/${id}`);
    const userData = (response.data as ApiResponse<BackendUser>).data || response.data;
    return normalizeUser(userData);
  },

  create: async (data: any): Promise<User> => {
    const payload = mapUserRequest(data);
    const body = payload && Object.keys(payload).length > 0 ? payload : data;
    const response = await api.post<ApiResponse<BackendUser> | BackendUser>("/users", body);
    const userData = (response.data as ApiResponse<BackendUser>).data || response.data;
    return normalizeUser(userData);
  },

  update: async (id: string, data: any, config?: any): Promise<User> => {
    const payload = mapUserRequest(data);
    const body = payload && Object.keys(payload).length > 0 ? payload : data;
    const response = config !== undefined
      ? await api.put<ApiResponse<BackendUser> | BackendUser>(`/users/${id}`, body, config)
      : await api.put<ApiResponse<BackendUser> | BackendUser>(`/users/${id}`, body);
    const userData = (response.data as ApiResponse<BackendUser>).data || response.data;
    return normalizeUser(userData);
  },

  delete: async (id: string, isActive?: boolean) => {
    const response = await api.delete(`/users/${id}`, isActive !== undefined ? { params: { isActive } } : undefined);
    return response.data;
  },
};
