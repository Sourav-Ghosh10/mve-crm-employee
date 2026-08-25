export interface Announcement {
    id: string;
    title: string;
    content: string;
    category: string;
    priority: string;
    expiryDate: string | null;
    createdAt?: string;
    acknowledgmentRequired: boolean;
    publishedBy: {
        name: string;
    };
    isRead: boolean;
    isAcknowledged: boolean;
    viewedAt?: string | null;
    acknowledgedAt?: string | null;
    isExpired?: boolean;
    status?: string;
}

export interface AnnouncementListResponse {
    announcements: Announcement[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalRecords?: number;
        limit?: number;
    };
}

export interface AnnouncementFilters {
    page?: number;
    limit?: number;
}
