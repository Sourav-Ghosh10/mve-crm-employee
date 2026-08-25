import api from './api';
import type {
    ReimbursementApiResponse,
    ReimbursementListApiResponse,
    CreateReimbursementPayload,
    ReimbursementTypeResponse
} from '../types/reimbursement.types';

export const reimbursementService = {
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
