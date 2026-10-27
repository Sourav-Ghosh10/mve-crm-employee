export interface Department {
    _id: string;
    id?: string;
    name: string;
    description?: string;
    isActive: boolean;
    employeeCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface DepartmentInput {
    name: string;
    description?: string;
    isActive?: boolean;
}

export interface Designation {
    _id: string;
    id?: string;
    title: string;
    name?: string;
    department?: any;
    description?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface DesignationInput {
    title: string;
    name?: string;
    department?: any;
    description?: string;
    isActive?: boolean;
}

export interface OfficeLocation {
    _id: string;
    id?: string;
    name: string;
    address: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        zipCode?: string;
    };
    contactInfo: {
        phone?: string;
        email?: string;
    };
    timezone?: string;
    isHeadquarters?: boolean;
    isActive?: boolean;
}

export interface OfficeLocationInput {
    name: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        zipCode?: string;
    };
    contactInfo?: {
        phone?: string;
        email?: string;
    };
    timezone?: string;
    isHeadquarters?: boolean;
    isActive?: boolean;
}

export interface Holiday {
    _id: string;
    id?: string;
    name: string;
    date: string;
    type?: string;
    description?: string;
    applicableLocations?: string[];
    isOptional?: boolean;
    isRecurring?: boolean;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface HolidayInput {
    name: string;
    date: string;
    type?: string;
    description?: string;
    applicableLocations?: string[];
    isOptional?: boolean;
    isRecurring?: boolean;
    isActive?: boolean;
}

export interface BreakType {
    _id: string;
    id?: string;
    name: string;
    code?: string;
    maxDuration?: number;
    maxDurationMinutes?: number;
    description?: string;
    isPaid?: boolean;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface BreakTypeInput {
    name: string;
    code?: string;
    maxDuration?: number;
    maxDurationMinutes?: number;
    description?: string;
    isPaid?: boolean;
    isActive?: boolean;
}

export interface LeaveType {
    _id: string;
    id?: string;
    name: string;
    code?: string;
    type?: string;
    daysAllowed?: number;
    daysAllowedPerYear?: number;
    description?: string;
    isPaid?: boolean;
    requiresApproval?: boolean;
    applicableTo?: string[];
    carryForwardAllowed?: boolean;
    maxCarryForwardDays?: number;
    maxCarryForward?: number;
    defaultAmount?: number;
    resetFrequency?: string;
    applicableDepartments?: string[];
    applicableDesignations?: string[];
    accrualType?: string;
    annualEntitlement?: number;
    workingHoursPerDay?: number;
    hourlyAccrualRate?: number;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface LeaveTypeInput {
    name: string;
    code?: string;
    type?: string;
    daysAllowed?: number;
    daysAllowedPerYear?: number;
    description?: string;
    isPaid?: boolean;
    requiresApproval?: boolean;
    applicableTo?: string[];
    carryForwardAllowed?: boolean;
    maxCarryForwardDays?: number;
    maxCarryForward?: number;
    defaultAmount?: number;
    resetFrequency?: string;
    applicableDepartments?: string[];
    applicableDesignations?: string[];
    accrualType?: string;
    annualEntitlement?: number;
    workingHoursPerDay?: number;
    hourlyAccrualRate?: number;
    isActive?: boolean;
}

export interface OrganizationFilters {
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
    department?: string;
    month?: number | string;
    year?: number | string;
    startDate?: string;
    endDate?: string;
}

export interface PaginatedResponse<T> {
    success?: boolean;
    data: T[];
    pagination?: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
    total: number;
    totalPages: number;
    page: number;
    limit: number;
}

export interface OrganizationResponse<T> {
    success: boolean;
    data: T[];
    pagination?: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

