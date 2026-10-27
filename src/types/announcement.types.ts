export type AnnouncementPriority = 'low' | 'medium' | 'high' | 'urgent' | 'critical';
export type AnnouncementCategory = 'general' | 'urgent' | 'event' | 'maintenance' | 'policy' | 'celebration' | string;

export interface Announcement {
    id: string;
    _id?: string;
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
    isGlobalEvent?: boolean;
    // Admin fields
    authorProfilePicture?: string;
    authorName?: string;
    deadlineTime?: string;
    publishDate?: string;
    expiresAt?: string;
    viewCount?: number;
    readByCount?: number;
    requiresAcknowledgement?: boolean;
    acknowledgmentCount?: number;
    acknowledgedByCount?: number;
    viewers?: any[];
    targetAudience?: any;
}

export interface CreateAnnouncementDto {
    title: string;
    content: string;
    category?: string;
    priority?: string;
    targetAudience?: any;
    publishDate?: string;
    expiresAt?: string;
    deadlineTime?: string;
    requiresAcknowledgement?: boolean;
    departments?: string[];
    locations?: string[];
    [key: string]: any;
}

export interface AnnouncementListResponse {
    announcements?: Announcement[];
    data?: Announcement[];
    success?: boolean;
    pagination: {
        currentPage?: number;
        totalPages?: number;
        totalRecords?: number;
        total?: number;
        pages?: number;
        page?: number;
        limit?: number;
    };
}

export interface AnnouncementFilters {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    priority?: string;
    status?: string;
}
