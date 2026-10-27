import api from "./api";
import type { RosterApiResponse } from "../types/schedule.types";

export interface RosterEditRequest {
  _id: string;
  id?: string;
  employeeId: any;
  employeeName?: string;
  requestType: string;
  status: string;
  reason?: string;
  date: string;
  requestedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export const scheduleService = {
  getRoster: async (
    userId: string,
    params?: {
      startDate?: string;
      endDate?: string;
      hardRefresh?: boolean;
    }
  ): Promise<RosterApiResponse> => {
    const response = await api.get(`/schedules/${userId}/roster`, {
      params: {
        ...params,
        ...(params?.hardRefresh ? { refresh: true } : {}),
      },
    });

    return response.data;
  },

  getAll: async (filters?: Record<string, any>): Promise<any> => {
    const response = await api.get("/schedules", { params: filters });
    return response.data;
  },

  getByDateSummary: async (filters?: Record<string, any>): Promise<any> => {
    const response = await api.get("/schedules/date-summary", { params: filters });
    return response.data;
  },

  create: async (data: Record<string, any>): Promise<any> => {
    const response = await api.post("/schedules", data);
    return response.data;
  },

  update: async (id: string, data: Record<string, any>): Promise<any> => {
    const response = await api.put(`/schedules/${id}`, data);
    return response.data;
  },

  bulkUpdate: async (data: Record<string, any>[]): Promise<any> => {
    const response = await api.post("/schedules/bulk", data);
    return response.data;
  },

  getEditRequestsStats: async (): Promise<any> => {
    const response = await api.get("/schedules/edit-requests/stats");
    return response.data;
  },

  getEditRequests: async (params?: Record<string, any>): Promise<any> => {
    const response = await api.get("/schedules/edit-requests", { params });
    return response.data;
  },

  reviewEditRequest: async (id: string, action: string, comments?: string): Promise<any> => {
    const response = await api.post(`/schedules/edit-requests/${id}/review`, { action, comments });
    return response.data;
  },
};

export default scheduleService;
