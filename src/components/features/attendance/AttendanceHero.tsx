import React from "react";
import { LogIn, LogOut, Coffee, PlayCircle, Clock, Loader2, CheckCircle, XCircle } from "lucide-react";
import { cn } from "../../../lib/utils";
import Button from "../../common/Button/Button";
import type { AttendanceStatus } from "../../../types/attendance";

interface AttendanceHeroProps {
    status: AttendanceStatus;
    currentTime: Date;
    lastActionTime: Date | null;
    workingHoursFormatted: string;
    breakDurationFormatted?: string;
    breakTypeName?: string;
    loading: boolean;
    initialLoading: boolean;
    onClockIn: () => void;
    onClockOut: () => void;
    onBreakStart: () => void;
    onBreakResume: () => void;
    formatTime: (date: Date) => string;
}

const AttendanceHero: React.FC<AttendanceHeroProps> = ({
    status,
    currentTime,
    lastActionTime,
    workingHoursFormatted,
    breakDurationFormatted,
    breakTypeName,
    loading,
    initialLoading,
    onClockIn,
    onClockOut,
    onBreakStart,
    onBreakResume,
    formatTime,
}) => {
    const getStatusConfig = () => {
        switch (status) {
            case "present":
            case "clock_in":
                return {
                    label: "Clocked In",
                    color: "text-success",
                    bgColor: "bg-success/10",
                    icon: <CheckCircle className="w-5 h-5 text-success" />,
                };
            case "on_break":
            case "break_start":
                return {
                    label: "On Break",
                    color: "text-info",
                    bgColor: "bg-info/10",
                    icon: <Coffee className="w-5 h-5 text-info" />,
                };
            case "clock_out":
                return {
                    label: "Clocked Out",
                    color: "text-warning",
                    bgColor: "bg-warning/10",
                    icon: <XCircle className="w-5 h-5 text-warning" />,
                };
            case "loading":
                return {
                    label: "Loading...",
                    color: "text-foreground-secondary",
                    bgColor: "bg-muted",
                    icon: <Loader2 className="w-5 h-5 animate-spin text-primary" />,
                };
            default:
                return {
                    label: "Not Clocked In",
                    color: "text-foreground-secondary",
                    bgColor: "bg-muted",
                    icon: <Clock className="w-5 h-5 text-foreground-secondary" />,
                };
        }
    };

    const statusConfig = getStatusConfig();
    const isWorking = status === "present" || status === "clock_in" || status === "break_resume" || status === "on_break";

    return (
        <div className="bg-gradient-to-br from-primary to-primary-dark p-4 sm:p-8 rounded-2xl shadow-lg text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex-1 text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                        <div className={cn("p-2 rounded-xl", statusConfig.bgColor)}>
                            {statusConfig.icon}
                        </div>
                        <div className="text-left">
                            <p className="text-white/70 text-xs">Current Status</p>
                            <p className="text-lg font-semibold text-white">{statusConfig.label}</p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        {isWorking && lastActionTime ? (
                            <>
                                <p className="text-white/70 text-xs sm:text-sm uppercase tracking-wider font-medium">Session Duration</p>
                                <p className="text-4xl sm:text-6xl font-bold tracking-tight font-mono">
                                    {workingHoursFormatted}
                                </p>
                                <div className="flex items-center justify-center lg:justify-start gap-2 mt-2 text-white/60 text-xs sm:text-sm">
                                    <Clock className="w-3 h-3" />
                                    <span>Started at {formatTime(lastActionTime)}</span>
                                    <span className="mx-1">•</span>
                                    <span>Current: {formatTime(currentTime)}</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex flex-col items-center lg:items-start group">
                                    <p className="text-4xl sm:text-6xl font-bold tracking-tight font-mono">
                                        {formatTime(currentTime)}
                                    </p>
                                    <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-medium mt-1 group-hover:text-white/60 transition-colors">
                                        {Intl.DateTimeFormat().resolvedOptions().timeZone.replace('_', ' ')}
                                    </p>
                                </div>
                                {lastActionTime && status === "clock_out" && (
                                    <p className="text-white/60 text-xs sm:text-sm mt-2">
                                        Last Shift Ended: {formatTime(lastActionTime)}
                                    </p>
                                )}
                            </>
                        )}

                        {status === "on_break" && breakDurationFormatted && (
                            <div className="mt-4 pt-3 border-t border-white/10 inline-block text-left">
                                <div className="flex items-center gap-3 animate-pulse">
                                    <Coffee className="w-5 h-5 text-warning/90" />
                                    <div>
                                        <p className="text-xs uppercase tracking-wider opacity-80 text-warning/90 font-bold">
                                            {breakTypeName ? `${breakTypeName} Timer` : "Break Timer"}
                                        </p>
                                        <p className="text-2xl font-mono font-bold text-white">{breakDurationFormatted}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-wrap justify-center lg:justify-start">
                    {initialLoading ? (
                        <div className="flex items-center gap-2 text-white/70">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Checking status...</span>
                        </div>
                    ) : (
                        <>
                            {(status === "not_clocked" || status === "clock_out") && (
                                <Button
                                    onClick={onClockIn}
                                    disabled={loading}
                                    variant="default"
                                    type="button"
                                    size="lg"
                                    className="bg-white text-primary hover:bg-white/90 border-0 shadow-lg"
                                    startIcon={loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                                >
                                    Clock In
                                </Button>
                            )}

                            {(status === "present" || status === "clock_in" || status === "break_resume") && (
                                <>
                                    <Button
                                        onClick={onBreakStart}
                                        disabled={loading}
                                        variant="secondary"
                                        type="button"
                                        size="lg"
                                        className="bg-white/10 text-white hover:bg-white/20 border-0"
                                        startIcon={loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Coffee className="w-5 h-5" />}
                                    >
                                        Start Break
                                    </Button>
                                    <Button
                                        onClick={onClockOut}
                                        disabled={loading}
                                        variant="destructive"
                                        type="button"
                                        size="lg"
                                        className="bg-error text-white hover:bg-error-light"
                                        startIcon={loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
                                    >
                                        Clock Out
                                    </Button>
                                </>
                            )}

                            {status === "on_break" && (
                                <>
                                    <Button
                                        onClick={onBreakResume}
                                        disabled={loading}
                                        variant="default"
                                        type="button"
                                        size="lg"
                                        className="bg-white text-primary hover:bg-white/90 border-0 shadow-lg"
                                        startIcon={loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlayCircle className="w-5 h-5" />}
                                    >
                                        Resume Work
                                    </Button>
                                    <Button
                                        onClick={onClockOut}
                                        disabled={loading}
                                        variant="destructive"
                                        type="button"
                                        size="lg"
                                        className="bg-error text-white hover:bg-error-light opacity-70 hover:opacity-100"
                                        startIcon={loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
                                    >
                                        Clock Out
                                    </Button>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttendanceHero;
