import api from './api';
import type {
  CreateLeaveRequestPayload,
  UpdateLeaveStatusPayload,
  LeaveRequestsResponse,
  LeaveBalanceApiResponse,
  LeaveRequestApiResponse,
  LeaveTypesResponse,
  LeaveStatsApiResponse,
  CalculateDaysResponse,
} from '../types/leave.types';

export const leaveService = {
  /**
   * Create a new leave request
   * POST /api/leave-requests
   */
  create: async (payload: CreateLeaveRequestPayload): Promise<LeaveRequestApiResponse> => {
    // Handle file uploads with FormData if attachments exist
    if (payload.attachments && payload.attachments.length > 0) {
      const formData = new FormData();
      formData.append('leaveType', payload.leaveType);
      formData.append('startDate', payload.startDate);
      formData.append('endDate', payload.endDate);
      formData.append('isHalfDay', String(payload.halfDay));
      if (payload.halfDayType) {
        formData.append('halfDayType', payload.halfDayType);
      }
      formData.append('reason', payload.reason);
      payload.attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      const response = await api.post('/leave-requests', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }

    const response = await api.post('/leave-requests', payload);
    return response.data;
  },

  /**
   * Get all leave requests (Admin/Manager view)
   * GET /api/leave-requests
   */
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    leaveType?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<LeaveRequestsResponse> => {
    const response = await api.get('/leave-requests', { params });
    return response.data;
  },

  /**
   * Alias for getMyRequests for compatibility
   */
  getRequests: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    leaveType?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<LeaveRequestsResponse> => {
    return leaveService.getMyRequests(params);
  },

  /**
   * Get current user's leave requests
   * GET /api/leave-requests/my-requests
   */
  getMyRequests: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    leaveType?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<LeaveRequestsResponse> => {
    const response = await api.get('/leave-requests/my-requests', { params });
    return response.data;
  },

  /**
   * Update leave request status (Approve/Reject)
   * PATCH /api/leave-requests/:id/status
   */
  updateStatus: async (id: string, payload: UpdateLeaveStatusPayload): Promise<LeaveRequestApiResponse> => {
    const response = await api.patch(`/leave-requests/${id}/status`, payload);
    return response.data;
  },

  /**
   * Get current user's leave balance
   * GET /api/leave-requests/balance
   */
  getMyBalance: async (): Promise<LeaveBalanceApiResponse> => {
    const response = await api.get('/leave-requests/balance');
    return response.data;
  },

  /**
   * Get specific employee's leave balance (Admin/Manager)
   * GET /api/leave-requests/employee/:userId/balance
   */
  getEmployeeBalance: async (userId: string): Promise<any> => {
    const response = await api.get(`/leave-requests/employee/${userId}/balance`);
    return response.data;
  },

  /**
   * Add opening balance for employee
   * POST /api/leave-balances/opening
   */
  addOpeningBalance: async (data: {
    employeeId: string;
    leaveTypeId: string;
    amount: number;
    description?: string;
  }): Promise<any> => {
    const response = await api.post('/leave-balances/opening', data);
    return response.data;
  },

  /**
   * Cancel a leave request (if still pending)
   * PATCH /api/leave-requests/:id/cancel
   */
  cancel: async (id: string): Promise<LeaveRequestApiResponse> => {
    const response = await api.patch(`/leave-requests/${id}/cancel`, {
      status: 'cancelled',
    });
    return response.data;
  },

  /**
   * Get all leave types
   * GET /api/leave-types
   */
  getLeaveTypes: async (params?: { page?: number; limit?: number }): Promise<LeaveTypesResponse> => {
    const response = await api.get('/leave-types', { params });
    return response.data;
  },

  /**
   * Alias for getMyStats for compatibility
   */
  getStats: async (): Promise<LeaveStatsApiResponse> => {
    return leaveService.getMyStats();
  },

  /**
   * Get current user's leave stats
   * GET /api/leave-requests/my-stats
   */
  getMyStats: async (): Promise<LeaveStatsApiResponse> => {
    const response = await api.get('/leave-requests/my-stats');
    return response.data;
  },

  /**
   * Calculate number of leave days between dates
   * GET /api/leave-requests/calculate-days
   */
  calculateDays: async (params: {
    startDate: string;
    endDate: string;
    halfDay: boolean;
  }): Promise<CalculateDaysResponse> => {
    const response = await api.get('/leave-requests/calculate-days', {
      params: {
        startDate: params.startDate,
        endDate: params.endDate,
        halfDay: params.halfDay,
      },
    });
    return response.data;
  },
};

export default leaveService;
