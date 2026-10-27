import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { attendanceService } from "../services/attendanceService";
import type { CustomAxiosConfig } from "../services/api";
import { getErrorMessage } from "../utils/errorHandlers";
import type { AttendanceStatus, AttendanceStatusResponse } from "../types/attendance";

const getCurrentCoordinates = (): Promise<{ latitude: number; longitude: number } | null> => {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve(null);
            return;
        }
        // Try High Accuracy first (with a short 3-second timeout)
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            (error) => {
                console.warn("High accuracy geolocation failed, falling back to standard accuracy:", error.message);
                // Fallback to standard accuracy (which resolves instantly on PCs/laptops via Wi-Fi/IP)
                navigator.geolocation.getCurrentPosition(
                    (fallbackPosition) => {
                        resolve({
                            latitude: fallbackPosition.coords.latitude,
                            longitude: fallbackPosition.coords.longitude
                        });
                    },
                    (fallbackError) => {
                        console.error("All geolocation attempts failed:", fallbackError.message);
                        resolve(null);
                    },
                    { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 }
                );
            },
            { enableHighAccuracy: true, timeout: 3000, maximumAge: 0 }
        );
    });
};

interface AttendanceContextType {
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
        breakStart: (breakTypeId?: string) => Promise<boolean>;
        breakResume: () => Promise<boolean>;
        fixIncompleteShift: (data: { shiftId: string; logoutTime: string; reason: string; shiftDate: string; remarks?: string }) => Promise<boolean>;
    };
    getNetWorkingDuration: () => { hours: number; minutes: number; totalMs: number };
    getBreakDuration: () => { hours: number; minutes: number; totalMs: number };
    workingHoursFormatted: string;
    breakDurationFormatted: string;
    isTimeSynced: boolean;
    refreshStatus: () => Promise<void>;
}


const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [status, setStatus] = useState<AttendanceStatus>("loading");
    const [lastActionTime, setLastActionTime] = useState<Date | null>(null);
    const [breakStartTime, setBreakStartTime] = useState<Date | null>(null);
    const [attendanceData, setAttendanceData] = useState<AttendanceStatusResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isTimeSynced, setIsTimeSynced] = useState(false);

    const syncPointRef = useRef<{ serverTime: number; localPerfTime: number } | null>(null);

    useEffect(() => {
        const timer = setInterval(() => {
            if (syncPointRef.current) {
                const elapsedMs = performance.now() - syncPointRef.current.localPerfTime;
                setCurrentTime(new Date(syncPointRef.current.serverTime + elapsedMs));
            }
            // Removed fallback to new Date() as it shows incorrect local time
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const queryClient = useQueryClient();

    const {
        data: fetchedData,
        isLoading: queryLoading,
        refetch: refreshStatus
    } = useQuery({
        queryKey: ["attendance-status"],
        queryFn: async () => {
            const config: CustomAxiosConfig = { skipLoading: true };
            const [correctionResp, statusResp] = await Promise.allSettled([
                attendanceService.checkCorrection(config),
                attendanceService.getMyStatus(config)
            ]);

            let newAttendanceData: AttendanceStatusResponse | null = null;
            let newStatus: AttendanceStatus = "not_clocked";

            // Handle Correction Response
            if (correctionResp.status === "fulfilled" && correctionResp.value?.success && correctionResp.value?.data) {
                const correctionData = correctionResp.value.data;
                if (correctionData.requiresLogoutCorrection) {
                    newAttendanceData = {
                        requiresLogoutCorrection: true,
                        incompleteShift: {
                            _id: correctionData.shiftId || "",
                            shiftId: correctionData.shiftId,
                            loginTime: correctionData.loginTime,
                            shiftDate: correctionData.shiftDate,
                            checkIn: { time: correctionData.loginTime || "" },
                            status: "incomplete"
                        }
                    } as AttendanceStatusResponse;

                    // Sync time from correction data if available
                    if (correctionData.timestamp) {
                        syncPointRef.current = {
                            serverTime: new Date(correctionData.timestamp).getTime(),
                            localPerfTime: performance.now()
                        };
                    }

                    return { attendanceData: newAttendanceData, status: "not_clocked" as AttendanceStatus };
                }
            }

            // Handle Main Status Response
            if (statusResp.status === "fulfilled" && statusResp.value?.success && statusResp.value?.data) {
                const data = statusResp.value.data as AttendanceStatusResponse;

                if (data.requiresLogoutCorrection && !data.incompleteShift) {
                    data.incompleteShift = {
                        _id: data.shiftId || "",
                        shiftId: data.shiftId,
                        loginTime: data.loginTime,
                        shiftDate: data.shiftDate,
                        checkIn: { time: data.loginTime || "" },
                        status: "incomplete"
                    };
                }
                newAttendanceData = data;

                // Sync clock with server time from response
                if (data.timestamp) {
                    syncPointRef.current = {
                        serverTime: new Date(data.timestamp).getTime(),
                        localPerfTime: performance.now()
                    };
                    setIsTimeSynced(true);
                }

                if (typeof data.isClockedIn === "boolean") {
                    if (data.isOnBreak || data.status === "on_break" || data.status === "break_start") {
                        newStatus = "on_break";
                    } else if (data.isClockedIn) {
                        newStatus = "present";
                    } else if ((data.totalSessions && data.totalSessions > 0) || (data.totalHours && data.totalHours > 0) || data.currentSession) {
                        newStatus = "clock_out";
                    } else {
                        newStatus = "not_clocked";
                    }
                } else {
                    const lastAction = data.lastAction?.toLowerCase();
                    if (lastAction === "clock_in" || lastAction === "present") newStatus = "present";
                    else if (lastAction === "clock_out") newStatus = "clock_out";
                    else if (lastAction === "break_start" || lastAction === "on_break") newStatus = "on_break";
                }
                return { attendanceData: newAttendanceData, status: newStatus };
            }

            return { attendanceData: null, status: "not_clocked" as AttendanceStatus };
        },
        staleTime: 30000, // 30 seconds
    });

    // Synchronize local states with query results for derived data
    useEffect(() => {
        if (fetchedData) {
            setStatus(fetchedData.status);
            setAttendanceData(fetchedData.attendanceData);

            const data = fetchedData.attendanceData;
            const newStatus = fetchedData.status;

            if (data) {
                // Sync clock if timestamp is present
                if (data.timestamp) {
                    const serverTime = new Date(data.timestamp).getTime();
                    syncPointRef.current = {
                        serverTime,
                        localPerfTime: performance.now()
                    };
                    setCurrentTime(new Date(serverTime));
                    setIsTimeSynced(true);
                }

                let timestamp = data.timestamp;
                if (newStatus === "clock_out") {
                    timestamp = data.currentSession?.checkOut?.time || data.timestamp;
                } else {
                    timestamp = data.currentSession?.checkIn?.time || data.timestamp;
                }
                const dateObj = timestamp ? new Date(timestamp) : null;
                setLastActionTime(dateObj && !isNaN(dateObj.getTime()) ? dateObj : null);

                if (newStatus === "on_break") {
                    const bStart = data.currentBreak?.startTime || data.timestamp;
                    setBreakStartTime(bStart ? new Date(bStart) : new Date());
                } else {
                    setBreakStartTime(null);
                }
            }
        }
    }, [fetchedData]);

    useEffect(() => {
        setInitialLoading(queryLoading);
    }, [queryLoading]);

    const handleAction = useCallback(async (action: (config?: { skipLoading?: boolean }) => Promise<unknown>, successStatus: AttendanceStatus, errorFallback: string) => {
        setLoading(true);
        setError(null);
        try {
            const resp = await action() as { success?: boolean };
            if (resp && resp.success) {
                setStatus(successStatus);
                // Invalidate query to trigger refresh
                await queryClient.invalidateQueries({ queryKey: ["attendance-status"] });
                return true;
            }
            return false;
        } catch (err) {
            setError(getErrorMessage(err, errorFallback));
            return false;
        } finally {
            setLoading(false);
        }
    }, [queryClient]);

    const actions = useMemo(() => ({
        clockIn: async () => {
            // Set loading immediately so the button disables before GPS fetch
            setLoading(true);
            setError(null);
            const coords = await getCurrentCoordinates();
            return handleAction(
                () => attendanceService.clockIn({
                    latitude: coords?.latitude,
                    longitude: coords?.longitude,
                    deviceInfo: navigator.userAgent
                }),
                "present",
                "Failed to clock in."
            );
        },
        clockOut: async () => {
            // Set loading immediately so the button disables before GPS fetch
            setLoading(true);
            setError(null);
            const coords = await getCurrentCoordinates();
            return handleAction(
                () => attendanceService.clockOut({
                    latitude: coords?.latitude,
                    longitude: coords?.longitude,
                    deviceInfo: navigator.userAgent
                }),
                "clock_out",
                "Failed to clock out."
            );
        },
        breakStart: (breakTypeId?: string) => handleAction(() => attendanceService.breakStart(breakTypeId), "on_break", "Failed to start break."),
        breakResume: () => handleAction(attendanceService.breakResume, "present", "Failed to resume work."),
        fixIncompleteShift: (data: { shiftId: string; logoutTime: string; reason: string; shiftDate: string; remarks?: string }) =>
            handleAction(() => attendanceService.fixIncompleteShift(data), status, "Failed to fix incomplete shift."),
    }), [handleAction, status]);

    // Background GPS Location Tracking (Every 30 Minutes) during active shifts
    useEffect(() => {
        if (status !== "present" && status !== "on_break") {
            return;
        }

        const trackIntervalTime = 30 * 60 * 1000; // 30 minutes

        const trackCurrentLocation = async () => {
            console.log("[Background Tracking] Running trackCurrentLocation...");
            const coords = await getCurrentCoordinates();
            console.log("[Background Tracking] Coords retrieved:", coords);
            if (coords) {
                try {
                    const result = await attendanceService.trackLocation({
                        latitude: coords.latitude,
                        longitude: coords.longitude,
                        type: "tracking"
                    });
                    console.log("[Background Tracking] API response received:", result);
                } catch (err) {
                    console.error("[Background Tracking] Failed to report background location:", err);
                }
            } else {
                console.warn("[Background Tracking] Geolocation coordinates were null (permission denied or secure context restriction). Skipping API call.");
            }
        };

        const initialTimeout = setTimeout(trackCurrentLocation, 5000);
        const intervalId = setInterval(trackCurrentLocation, trackIntervalTime);

        return () => {
            clearTimeout(initialTimeout);
            clearInterval(intervalId);
        };
    }, [status]);

    const getNetWorkingDuration = useCallback(() => {

        if (!lastActionTime || (status !== "present" && status !== "on_break")) return { hours: 0, minutes: 0, totalMs: 0 };
        const grossElapsedMs = currentTime.getTime() - lastActionTime.getTime();
        if (grossElapsedMs < 0) return { hours: 0, minutes: 0, totalMs: 0 };
        
        let totalUnpaidMs = (attendanceData?.currentSession?.durationMs || 0) - (attendanceData?.currentSession?.netMs || 0);
        if (status === "on_break" && breakStartTime) {
            const activeBreakDurationMs = currentTime.getTime() - breakStartTime.getTime();
            const isPaid = attendanceData?.currentBreak?.breakType?.isPaid === true;
            if (!isPaid) {
                totalUnpaidMs += activeBreakDurationMs;
            } else {
                const maxDurationMins = attendanceData?.currentBreak?.breakType?.maxDuration || 0;
                if (maxDurationMins > 0) {
                    const maxDurationMs = maxDurationMins * 60000;
                    if (activeBreakDurationMs > maxDurationMs) {
                        totalUnpaidMs += (activeBreakDurationMs - maxDurationMs);
                    }
                }
            }
        }
        const netMs = Math.max(0, grossElapsedMs - totalUnpaidMs);
        const hours = Math.floor(netMs / (1000 * 60 * 60));
        const minutes = Math.floor((netMs % (1000 * 60 * 60)) / (1000 * 60));
        return { hours, minutes, totalMs: netMs };
    }, [lastActionTime, status, currentTime, breakStartTime, attendanceData]);

    const getBreakDuration = useCallback(() => {
        if (!breakStartTime) return { hours: 0, minutes: 0, totalMs: 0 };
        const diff = currentTime.getTime() - breakStartTime.getTime();
        if (diff < 0) return { hours: 0, minutes: 0, totalMs: 0 };
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return { hours, minutes, totalMs: diff };
    }, [breakStartTime, currentTime]);

    const workingHoursFormatted = useMemo(() => {
        const { hours, minutes } = getNetWorkingDuration();
        return `${hours}h ${minutes}m`;
    }, [getNetWorkingDuration]);

    const breakDurationFormatted = useMemo(() => {
        const { hours, minutes } = getBreakDuration();
        return `${hours}h ${minutes}m`;
    }, [getBreakDuration]);

    const value = useMemo(() => ({
        status,
        lastActionTime,
        breakStartTime,
        attendanceData,
        loading,
        initialLoading,
        error,
        setError,
        currentTime,
        isTimeSynced,
        actions,
        getNetWorkingDuration,
        getBreakDuration,
        workingHoursFormatted,
        breakDurationFormatted,
        refreshStatus: () => refreshStatus() as any,
    }), [
        status,
        lastActionTime,
        breakStartTime,
        attendanceData,
        loading,
        initialLoading,
        error,
        currentTime,
        isTimeSynced,
        actions,
        getNetWorkingDuration,
        getBreakDuration,
        workingHoursFormatted,
        breakDurationFormatted,
        refreshStatus
    ]);


    return <AttendanceContext.Provider value={value}>{children}</AttendanceContext.Provider>;
};

export const useAttendanceContext = () => {
    const context = useContext(AttendanceContext);
    if (context === undefined) {
        throw new Error("useAttendanceContext must be used within an AttendanceProvider");
    }
    return context;
};
