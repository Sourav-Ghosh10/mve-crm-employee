export interface ShiftDetail {
    startTime: string;
    endTime: string;
}

export interface DayShift {
    _id: string;
    employeeId: string;
    date: string;
    shiftType: string;
    startTime: string[];
    endTime: string[];
    location?: string;
    department?: string;
    isRecurring: boolean;
    shifts: ShiftDetail[];
    holidayName?: string;
}

export interface ShiftData {
    shiftType?: string;
    startTime?: string | string[];
    endTime?: string | string[];
    location?: string;
    department?: string;
    isRecurring?: boolean;
    shifts?: ShiftDetail[];
    holidayName?: string;
    [key: string]: any;
}

export interface EmployeeRoster {
    _id: string;
    id?: string;
    employeeId: string;
    employeeName?: string;
    department?: string;
    designation?: string;
    shifts?: Record<string, any> | any[];
    shiftData?: Record<string, any>;
    [key: string]: any;
}

export interface ScheduleFilters {
    startDate?: string;
    endDate?: string;
    department?: string;
    location?: string;
    employeeId?: string;
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    [key: string]: any;
}

export interface PaginatedScheduleResponse {
    data: any[];
    total: number;
    totalPages: number;
    page: number;
    limit: number;
}

export interface RosterData {
    _id: string;
    employeeId: string;
    Info: {
        firstName: string;
        lastName: string;
        email: string;
        department: string;
        designation: string;
    };
    shiftData: Record<string, DayShift>;
}

export interface RosterApiResponse {
    success: boolean;
    data: RosterData[];
}
