export interface ReimbursementType {
    _id: string;
    name: string;
    description?: string;
    isActive: boolean;
    maxAmount?: number;
    requiresReceipt?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface ReimbursementTypeResponse {
    success: boolean;
    data: ReimbursementType[];
    pagination?: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

export type ReimbursementStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface ReimbursementAttachment {
    fileName: string;
    fileUrl: string;
}

export interface ReimbursementTypeInput {
    name: string;
    description?: string;
    maxAmount?: number;
    requiresReceipt?: boolean;
    isActive?: boolean;
}

export interface PaginatedReimbursementResponse {
    data: Reimbursement[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
    total: number;
    totalPages: number;
    page: number;
    limit: number;
    success?: boolean;
    message?: string;
}

export interface Reimbursement {
    _id: string;
    id?: string | number;
    reimbursementTypeId: string;
    reimbursementType: string;
    title: string;
    description: string;
    amount: number;
    expenseDate: string;
    status: ReimbursementStatus;
    attachments: ReimbursementAttachment[];
    employeeId: any;
    approval?: {
        approvedBy?: {
            personalInfo?: {
                firstName: string;
                lastName: string;
            };
            fullName?: string;
            id?: string;
        };
        approvedAt?: string;
        rejectionReason?: string;
    };
    isActive: boolean;
    rejectionReason?: string;
    createdAt: string;
    updatedAt: string;
    __v?: number;
}

export interface CreateReimbursementPayload {
    reimbursementTypeId: string;
    reimbursementType: string;
    title: string;
    description: string;
    amount: number;
    expenseDate: string;
    attachments?: ReimbursementAttachment[];
}

export type UpdateReimbursementPayload = Partial<CreateReimbursementPayload>;

export interface ReimbursementApiResponse {
    success: boolean;
    data: Reimbursement;
    message?: string;
}

export interface ReimbursementListApiResponse {
    success: boolean;
    data: Reimbursement[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
    message?: string;
}
