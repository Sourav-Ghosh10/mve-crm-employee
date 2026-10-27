// Leave Request Types
export type LeaveType = 'annual' | 'sick' | 'personal' | 'unpaid' | 'maternity' | 'paternity' | 'bereavement' | 'compensatory' | (string & {});

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface LeaveRequest {
    _id: string;
    employeeId: string;
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    halfDay: boolean;
    halfDayType?: 'first_half' | 'second_half';
    numberOfDays: number;
    reason: string;
    status: LeaveStatus;
    attachments?: string[];
    approvalFlow?: {
        approverId: string;
        approverRole: string;
        action: string;
        actionDate: string;
        comments: string;
        _id: string;
    }[];
    rejectionReason?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UserLeaveBalance {
    leaveTypeId?: string;
    name: string;
    code: string;
    currentBalance: number | null;
    used: number;
    totalAllocated: number | null;
    isPaid: boolean;
    workingHoursPerDay?: number;
}

export interface LeaveBalanceDetails {
    leaveTypeId?: string;
    leaveTypeName?: string;
    name?: string;
    allocated?: number;
    used?: number;
    balance?: number;
    currentBalance?: number | null;
    totalAllocated?: number | null;
    isPaid?: boolean;
    [key: string]: any;
}

export interface LeaveBalanceResponse {
    userId: string;
    name: string;
    department: string;
    balances: UserLeaveBalance[];
}

export type EmployeeLeaveBalanceResponse = LeaveBalanceResponse & {
    data?: any;
    [key: string]: any;
};

export interface CreateLeaveRequestPayload {
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    halfDay: boolean;
    halfDayType?: 'first_half' | 'second_half';
    reason: string;
    attachments?: File[];
}

export interface ApiError {
    code: string;
    message: string;
    timestamp: string;
}

export interface LeaveRequestsResponse {
    success?: boolean;
    status?: string;
    data: LeaveRequest[];
    message?: string;
}

export interface LeaveRequestApiResponse {
    success?: boolean;
    status?: string;
    data?: LeaveRequest;
    message?: string;
    error?: ApiError;
}

export interface LeaveBalanceApiResponse {
    success?: boolean;
    status?: string;
    data: LeaveBalanceResponse;
    message?: string;
}

export interface PerTypeBalance {
    name: string;
    code: string;
    balance: number;
    used: number;
    total: number;
    isPaid: boolean;
}

export interface LeaveStats {
    available: number;
    used: number;
    approved: number;
    approvedLeaveHours: number;
    approvedLeaveDays: number;
    pending: number;
    totalAllocated: number;
}

export interface LeaveStatsData {
    summary: LeaveStats;
    perType: PerTypeBalance[];
}

export interface LeaveStatsApiResponse {
    status: string;
    data: LeaveStatsData;
    message?: string;
}

export interface UpdateLeaveStatusPayload {
    status: LeaveStatus;
    rejectionReason?: string;
}

export interface ApiLeaveType {
    _id: string;
    name: string;
    code: string;
    description: string;
    isPaid: boolean;
    isActive: boolean;
    defaultAmount: number;
    maxCarryForward: number;
    resetFrequency: 'yearly' | 'monthly' | 'quarterly';
    applicableDepartments: string[];
    createdAt: string;
    updatedAt: string;
}

export interface LeaveTypesResponse {
    status: string;
    data: ApiLeaveType[];
    pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface CalculateDaysResponse {
    status: string;
    data: {
        numberOfDays: number;
        breakdown?: {
            date: string;
            dayOfWeek: string;
            isHoliday: boolean;
            holidayName: string | null;
            isWeeklyOff: boolean;
            isSharedSchedule: boolean;
            isCounted: boolean;
            reason: string;
        }[];
    };
    message?: string;
}

// UI display helpers
export const leaveTypeLabels: Record<LeaveType, string> = {
    annual: 'Annual Leave',
    sick: 'Sick Leave',
    personal: 'Personal Leave',
    unpaid: 'Unpaid Leave',
    maternity: 'Maternity Leave',
    paternity: 'Paternity Leave',
    bereavement: 'Bereavement Leave',
    compensatory: 'Compensatory Off',
};

export const leaveStatusLabels: Record<LeaveStatus, string> = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
};

export const leaveTypeColors: Record<LeaveType, string> = {
    annual: 'primary',
    sick: 'error',
    personal: 'accent',
    unpaid: 'foreground-secondary',
    maternity: 'success',
    paternity: 'success',
    bereavement: 'foreground-tertiary',
    compensatory: 'info',
};

