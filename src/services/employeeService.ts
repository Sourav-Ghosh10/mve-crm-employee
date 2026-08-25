import api from "./api";
import type { AxiosRequestConfig } from "axios";

export interface RecentActivity {
    type: string;
    timestamp: string;
    title: string;
    description: string;
    referenceId?: string;
    metadata?: Record<string, unknown>;
}

export interface ActivityResponse {
    success: boolean;
    message: string;
    data: {
        date: string;
        employeeId: string;
        activities: RecentActivity[];
    };
}

export const employeeService = {
    getRecentActivity: async (params: { date: string; employeeId?: string }, config?: AxiosRequestConfig) => {
        const response = await api.get<ActivityResponse>("/employee/recent-activity", { ...config, params });
        return response.data;
    }
};
