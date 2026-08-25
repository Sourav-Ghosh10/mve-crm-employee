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
