import { createContext } from "react";
import type { AttendanceStatus, AttendanceStatusResponse } from "../types/attendance";

export interface AttendanceContextType {
    status: AttendanceStatus;
    lastActionTime: Date | null;
    breakStartTime: Date | null;
    attendanceData: AttendanceStatusResponse | null;
    loading: boolean;
    initialLoading: boolean;
    error: string | null;
    setError: (error: string | null) => void;
    currentTime: Date;
    actions: {
        clockIn: () => Promise<boolean>;
        clockOut: () => Promise<boolean>;
        breakStart: () => Promise<boolean>;
        breakResume: () => Promise<boolean>;
        fixIncompleteShift: (data: { shiftId: string; logoutTime: string; reason: string; shiftDate: string; remarks?: string }) => Promise<boolean>;
    };
    getNetWorkingDuration: () => { hours: number; minutes: number; totalMs: number };
    getBreakDuration: () => { hours: number; minutes: number; totalMs: number };
    workingHoursFormatted: string;
    breakDurationFormatted: string;
    refreshStatus: () => Promise<void>;
}

export const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);
