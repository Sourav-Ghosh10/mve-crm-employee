import api from "./api";
import type { AnnouncementListResponse, AnnouncementFilters } from "../types/announcement.types";

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export const announcementService = {
    getEmployeeAnnouncements: async (filters: AnnouncementFilters = {}): Promise<AnnouncementListResponse> => {
        const { page = 1, limit = 5 } = filters;

        // console.log('🔍 Fetching announcements with filters:', { page, limit });

        const response = await api.get<ApiResponse<AnnouncementListResponse>>("/announcements/employee", {
            params: { page, limit },
        });

        // console.log('📢 Announcements API Response:', response.data);

        return response.data.data;
    },

    markRead: async (id: string) => {
        return api.put(`/announcements/${id}/mark-read`);
    },

    acknowledge: async (id: string) => {
        return api.put(`/announcements/${id}/acknowledge`);
    },

    markAllRead: async () => {
        return api.put(`/announcements/employee/mark-all-read`);
    }
};
