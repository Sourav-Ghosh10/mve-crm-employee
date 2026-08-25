export type AttendanceStatus = "clock_in" | "clock_out" | "break_start" | "break_resume" | "present" | "on_break" | "not_clocked" | "loading";

export interface AttendanceActionTime {
    time: string;
    ipAddress?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
}

export interface AttendanceSession {
    checkIn: AttendanceActionTime;
    checkOut?: AttendanceActionTime;
    durationMs: number;
    durationString: string;
    breakMs: number;
    breakDurationString: string;
    breakCount: number;
    netMs: number;
    netDurationString: string;
}

export interface IncompleteShift {
    _id: string;
    shiftId?: string;
    loginTime?: string;
    shiftDate?: string;
    checkIn: AttendanceActionTime;
    status: string;
}


export interface AttendanceBreak {
    startTime: string;
    endTime?: string;
    breakType?: BreakType;
    duration?: number;
    durationString?: string;
}

export interface AttendanceStatusResponse {
    isClockedIn: boolean;
    isOnBreak?: boolean;
    currentSession?: AttendanceSession;
    currentBreak?: AttendanceBreak;
    totalSessions?: number;
    totalBreakCount?: number;
    totalHours?: number;
    totalDurationString?: string;
    totalBreakDurationString?: string;
    status?: string;
    lastAction?: string;
    timestamp?: string;
    monthlyOffDays?: string[];
    monthlyOffDaysCount?: number;
    monthlyTargetHours?: number;
    monthlyAttendancePercentage?: number;
    monthlyOvertimeHours?: number;
    monthlyOvertimeString?: string;
    incompleteShift?: IncompleteShift;
    requiresLogoutCorrection?: boolean;
    shiftId?: string;
    loginTime?: string;
    shiftDate?: string;
    monthlyHolidays?: { date: string; name: string }[];
    monthlyHolidaysCount?: number;
    monthlyLeaves?: any[];
    monthlyLeavesCount?: number;
    monthlyAbsentDays?: string[];
    monthlyAbsentDaysCount?: number;
    monthlyPresentDays?: number;
    monthlyWorkingDaysSoFar?: number;
}

export interface AttendanceRecord {
    _id: string;
    date: string;
    shiftDate?: string;
    checkIn?: AttendanceActionTime;
    checkOut?: AttendanceActionTime;
    status: string;
    durationMs?: number;
}


export interface BreakType {
    _id: string;
    name: string;
    code: string;
    description?: string;
    maxDuration: number;
    isPaid?: boolean;
    isActive: boolean;
}
