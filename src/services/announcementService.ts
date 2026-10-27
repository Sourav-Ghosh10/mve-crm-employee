import api from "./api";
import type { Announcement, AnnouncementListResponse, AnnouncementFilters, CreateAnnouncementDto } from "../types/announcement.types";

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export const announcementService = {
    getAll: async (filters: AnnouncementFilters = {}): Promise<AnnouncementListResponse> => {
        const response = await api.get<ApiResponse<AnnouncementListResponse> | AnnouncementListResponse>("/announcements", {
            params: filters,
        });
        if ((response.data as any).data && Array.isArray((response.data as any).data)) {
            return response.data as AnnouncementListResponse;
        }
        return (response.data as ApiResponse<AnnouncementListResponse>).data || response.data;
    },

    getEmployeeAnnouncements: async (filters: AnnouncementFilters = {}): Promise<AnnouncementListResponse> => {
        const { page = 1, limit = 5 } = filters;

        const response = await api.get<ApiResponse<AnnouncementListResponse>>("/announcements/employee", {
            params: { page, limit },
        });

        return response.data.data;
    },

    getById: async (id: string): Promise<ApiResponse<Announcement>> => {
        const response = await api.get<ApiResponse<Announcement> | Announcement>(`/announcements/${id}`);
        if ((response.data as ApiResponse<Announcement>).data) {
            return response.data as ApiResponse<Announcement>;
        }
        return {
            success: true,
            data: response.data as Announcement,
        };
    },

    create: async (data: CreateAnnouncementDto | any): Promise<ApiResponse<Announcement>> => {
        const response = await api.post<ApiResponse<Announcement> | Announcement>("/announcements", data);
        if ((response.data as ApiResponse<Announcement>).data) {
            return response.data as ApiResponse<Announcement>;
        }
        return {
            success: true,
            data: response.data as Announcement,
        };
    },

    update: async (id: string, data: Partial<CreateAnnouncementDto> | any): Promise<ApiResponse<Announcement>> => {
        const response = await api.put<ApiResponse<Announcement> | Announcement>(`/announcements/${id}`, data);
        if ((response.data as ApiResponse<Announcement>).data) {
            return response.data as ApiResponse<Announcement>;
        }
        return {
            success: true,
            data: response.data as Announcement,
        };
    },

    delete: async (id: string): Promise<{ success: boolean; message?: string }> => {
        const response = await api.delete(`/announcements/${id}`);
        return response.data;
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
