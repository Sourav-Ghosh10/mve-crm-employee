// import api from './api';

import api from "./api";
import type { AxiosRequestConfig } from "axios";

export const attendanceService = {
  getAll: async (params?: any) => {
    const response = await api.get("/attendance", { params });
    return response.data;
  },
  getMemberAttendance: async (params?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get("/attendance/me", { params });
    return response.data;
  },
  getByDateAndUser: async (date: string, userId: string) => {
    const response = await api.get(`/attendance/${date}/${userId}`);
    return response.data?.data || response.data;
  },
  clockIn: async (data?: { latitude?: number; longitude?: number; deviceInfo?: string; remarks?: string }) => {
    const response = await api.post("/attendance/clock-in", data);
    return response.data;
  },
  clockOut: async (data?: { latitude?: number; longitude?: number; deviceInfo?: string }) => {
    const response = await api.post("/attendance/clock-out", data);
    return response.data;
  },
  breakStart: async (breakTypeId?: string) => {
    const response = await api.post("/attendance/break-start", { breakTypeId });
    return response.data;
  },
  breakResume: async () => {
    const response = await api.post("/attendance/break-resume");
    return response.data;
  },
  getBreakTypes: async () => {
    const response = await api.get("/break-types", { params: { isActive: true } });
    return response.data;
  },
  getMyStatus: async (config?: AxiosRequestConfig) => {
    const response = await api.get("/attendance/status", config);
    return response.data;
  },
  checkCorrection: async (config?: AxiosRequestConfig) => {
    const response = await api.get("/attendance/check-correction", config);
    return response.data;
  },

  fixIncompleteShift: async (data: {
    shiftId: string;
    logoutTime: string;
    reason: string;
    shiftDate: string;
    remarks?: string;

  }) => {
    const response = await api.post("/attendance/correct-logout", data);
    return response.data;

  },
  trackLocation: async (data: { latitude: number; longitude: number; type?: string }) => {
    const response = await api.post("/location/track", data, { skipLoading: true } as any);
    return response.data;
  },
};

