import api from "./api";
import type { RosterApiResponse } from "../types/schedule.types";

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
};

export default scheduleService;
