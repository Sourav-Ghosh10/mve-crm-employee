import api from './api';
import type {
    Reimbursement,
    ReimbursementApiResponse,
    ReimbursementListApiResponse,
    CreateReimbursementPayload,
    ReimbursementTypeResponse,
    PaginatedReimbursementResponse
} from '../types/reimbursement.types';

export const reimbursementService = {
    /**
     * Get all reimbursements (admin/manager view with pagination and filters)
     */
    getAll: async (params?: any): Promise<PaginatedReimbursementResponse> => {
        const response = await api.get('/reimbursements', { params });
        return response.data;
    },

    /**
     * Get reimbursement by ID
     */
    getById: async (id: string): Promise<{ success: boolean; data: Reimbursement }> => {
        const response = await api.get(`/reimbursements/${id}`);
        return response.data;
    },

    /**
     * Update reimbursement status (approve/reject)
     */
    updateStatus: async (id: string, payload: { status: string; rejectionReason?: string }): Promise<{ success: boolean; data: Reimbursement }> => {
        const response = await api.patch(`/reimbursements/${id}/status`, payload);
        return response.data;
    },

    /**
     * Create a new reimbursement request
     * POST /api/reimbursements
     * Sends data as JSON in the body
     */
    create: async (payload: CreateReimbursementPayload): Promise<ReimbursementApiResponse> => {
        const response = await api.post('/reimbursements', payload);
        return response.data;
    },

    /**
     * Get current user's reimbursements
     * GET /api/reimbursements/my
     */
    getMyRequests: async (): Promise<ReimbursementListApiResponse> => {
        const response = await api.get('/reimbursements/my');
        return response.data;
    },

    /**
     * Get active reimbursement types
     * GET /api/reimbursements/types
     */
    getTypes: async (): Promise<ReimbursementTypeResponse> => {
        const response = await api.get('/reimbursement-types/active');
        return response.data;
    },

    /**
     * Delete/Cancel a reimbursement request
     * DELETE /api/reimbursements/{id}
     */
    delete: async (id: string): Promise<ReimbursementApiResponse> => {
        const response = await api.delete(`/reimbursements/${id}`);
        return response.data;
    },

    /**
     * Update an existing reimbursement request
     * PATCH /api/reimbursements/{id}
     */
    update: async (id: string, payload: Partial<CreateReimbursementPayload>): Promise<ReimbursementApiResponse> => {
        const response = await api.patch(`/reimbursements/${id}`, payload);
        return response.data;
    }
};

export default reimbursementService;
