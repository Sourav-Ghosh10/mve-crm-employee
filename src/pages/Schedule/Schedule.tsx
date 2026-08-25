import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, ChevronLeft, ChevronRight, Sun, Moon, Umbrella} from "lucide-react";
import Card from "../../components/common/Card/Card";
import Button from "../../components/common/Button/Button";
import { cn } from "../../lib/utils";
import { useAppSelector } from "../../store/hooks";
import leaveService from "../../services/leaveService";
import scheduleService from "../../services/scheduleService";
import systemSettingsService from "../../services/systemSettingsService";
import type { LeaveRequest } from "../../types/leave.types";


interface Shift {
  day: string;
  shortDay: string;
  date: number;
  shift: string;
  isToday: boolean;
  isWeekend: boolean;
  leave?: LeaveRequest;
  holiday?: string;
}

const Schedule: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [currentDate] = useState(new Date());
  const [weekOffset, setWeekOffset] = useState(0);
  const [isHardRefresh, setIsHardRefresh] = useState(false);
  const queryClient = useQueryClient();

  const formatDateKey = (date: Date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  };

  const formatTime = (time: string) => {
    if (!time) return "N/A";
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const workingHours = user?.workingHours;
  const startTime = workingHours?.startTime || "09:00";
  const endTime = workingHours?.endTime || "17:00";
  const weeklyOff = useMemo(() => workingHours?.weeklyOff || ["Saturday", "Sunday"], [workingHours?.weeklyOff]);

  // Calculate range based on current view
  const { weekStart, weekEnd } = useMemo(() => {
    const start = new Date(currentDate);
    start.setDate(currentDate.getDate() - currentDate.getDay() + 1 + (weekOffset * 7));
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return {
      weekStart: formatDateKey(start),
      weekEnd: formatDateKey(end)
    };
  }, [currentDate, weekOffset]);

  // Fetch approved leaves
  const {
    data: approvedLeaves = []
  } = useQuery({
    queryKey: ["schedule-leaves", user?.id, weekStart, weekEnd],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await leaveService.getMyRequests({
        status: 'approved',
        startDate: weekStart,
        endDate: weekEnd
      });
      if (response.status === 'success' || response.success) {
        return response.data;
      }
      return [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch system settings for Saturday Half Day
  const { data: systemSettings } = useQuery({
    queryKey: ["system-settings-saturday"],
    queryFn: async () => {
      try {
        const res = await systemSettingsService.getSettingByKey("saturday_half_day");
        return res;
      } catch (e) {
        return null;
      }
    },
    staleTime: 60 * 60 * 1000,
  });

  const isSaturdayHalfDayEnabled = !!systemSettings?.value?.enabled;

  // Fetch roster
  const {
    data: rosterData = null,
    // isFetching: isRosterFetching
  } = useQuery({
    queryKey: ["schedule-roster", user?.id, weekStart, weekEnd, isHardRefresh],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await scheduleService.getRoster(user.id, {
        startDate: weekStart,
        endDate: weekEnd,
        hardRefresh: isHardRefresh
      });

      const result = response.success && response.data && response.data.length > 0
        ? response.data[0]
        : null;

      if (isHardRefresh) {
        // Update the main cache entry (where isHardRefresh is false)
        queryClient.setQueryData(["schedule-roster", user?.id, weekStart, weekEnd, false], result);
        // Reset the flag to return to normal behavior
        setTimeout(() => setIsHardRefresh(false), 0);
      }

      return result;
    },
    enabled: !!user?.id,
    staleTime: isHardRefresh ? 0 : 5 * 60 * 1000,
  });

  const shifts = useMemo((): Shift[] => {
    const days = [];
    const weekStartObj = new Date(currentDate);
    weekStartObj.setDate(currentDate.getDate() - currentDate.getDay() + 1 + (weekOffset * 7));

    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStartObj);
      day.setDate(weekStartObj.getDate() + i);
      const dayName = day.toLocaleDateString("en-US", { weekday: "long" });
      const dayKey = formatDateKey(day);
      const isSaturday = day.getDay() === 6;
      const rosterShift = rosterData?.shiftData[dayKey];

      const isWeekend = rosterShift
        ? rosterShift.shiftType === 'off'
        : weeklyOff.includes(dayName);

      const isToday = day.toDateString() === new Date().toDateString();

      // Check if there's an approved leave on this day
      const leave = approvedLeaves.find((l) => {
        const leaveStart = new Date(l.startDate);
        const leaveEnd = new Date(l.endDate);
        const checkDay = new Date(day);
        checkDay.setHours(0, 0, 0, 0);
        const start = new Date(leaveStart);
        start.setHours(0, 0, 0, 0);
        const end = new Date(leaveEnd);
        end.setHours(0, 0, 0, 0);
        return checkDay >= start && checkDay <= end;
      });

      let shiftDisplay = "";
      let holidayName = "";

      if (leave) {
        shiftDisplay = "On Leave";
      } else if (rosterShift) {
        if (rosterShift.shiftType === 'Holiday') {
          shiftDisplay = "Holiday";
          holidayName = rosterShift.holidayName || "Public Holiday";
        } else if (rosterShift.shiftType === 'off') {
          shiftDisplay = "Off";
        } else if (rosterShift.shifts && rosterShift.shifts.length > 0) {
          shiftDisplay = rosterShift.shifts.map(s => `${formatTime(s.startTime)} - ${formatTime(s.endTime)}`).join(', ');
        } else if (rosterShift.startTime?.[0] && rosterShift.endTime?.[0]) {
          shiftDisplay = `${formatTime(rosterShift.startTime[0])} - ${formatTime(rosterShift.endTime[0])}`;
        } else {
          shiftDisplay = `${formatTime(startTime)} - ${formatTime(endTime)}`;
        }
      } else {
        shiftDisplay = isWeekend ? "Off" : `${formatTime(startTime)} - ${formatTime(endTime)}`;
      }
      
      if (!leave && !isWeekend && isSaturday && isSaturdayHalfDayEnabled) {
          if (shiftDisplay.includes(" - ")) {
              // Adjust display to indicate half day
              shiftDisplay += " (Half Day)";
          } else {
              shiftDisplay = "Half Day";
          }
      }

      days.push({
        day: dayName,
        shortDay: day.toLocaleDateString("en-US", { weekday: "short" }),
        date: day.getDate(),
        shift: shiftDisplay,
        isToday,
        isWeekend,
        leave,
        holiday: holidayName,
      });
    }
    return days;
  }, [currentDate, weekOffset, approvedLeaves, rosterData, startTime, endTime, weeklyOff, isSaturdayHalfDayEnabled]);



  const getWeekRange = () => {
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1 + (weekOffset * 7));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">My Schedule</h1>
        <div className="flex items-center gap-2">
          {/* <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsHardRefresh(true)}
            disabled={isHardRefresh || isRosterFetching}
            className="text-foreground-secondary hover:text-primary transition-colors"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", (isHardRefresh || isRosterFetching) && "animate-spin")} />
            <span className="hidden sm:inline">Hard Refresh</span>
          </Button> */}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekOffset(weekOffset - 1)}
            startIcon={<ChevronLeft className="w-4 h-4" />}
          >
            <span className="hidden sm:inline">Previous</span>
          </Button>
          <span className="text-sm font-medium text-foreground px-3">
            {getWeekRange()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekOffset(weekOffset + 1)}
            endIcon={<ChevronRight className="w-4 h-4" />}
          >
            <span className="hidden sm:inline">Next</span>
          </Button>
        </div>
      </div>

      {/* Today's Shift Highlight */}
      {
        (() => {
          const todayShift = shifts.find(s => s.isToday);
          const isOnLeave = !!todayShift?.leave;
          const isHoliday = !!todayShift?.holiday;

          return (
            <div className={cn(
              "p-4 sm:p-6 rounded-2xl shadow-lg text-white transition-all duration-300",
              isHoliday
                ? "bg-gradient-to-br from-warning to-warning/80"
                : isOnLeave
                  ? "bg-gradient-to-br from-accent to-accent/80"
                  : "bg-gradient-to-br from-primary to-primary-dark"
            )}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                    {isHoliday ? <Sun className="w-7 h-7" /> : isOnLeave ? <Umbrella className="w-7 h-7" /> : <Clock className="w-7 h-7" />}
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">
                      {isHoliday ? "Public Holiday" : isOnLeave ? "Today's Status" : "Today's Shift"}
                    </p>
                    <p className="text-xl sm:text-2xl font-bold">
                      {isHoliday ? todayShift?.holiday : isOnLeave ? `On Leave (${todayShift?.leave?.leaveType})` : `${formatTime(startTime)} - ${formatTime(endTime)}`}
                    </p>
                  </div>
                </div>
                {!isOnLeave && !isHoliday && (
                  <div className="flex flex-wrap gap-3 text-sm">
                    <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                      <Sun className="w-4 h-4" />
                      <span>Start: {formatTime(startTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                      <Moon className="w-4 h-4" />
                      <span>End: {formatTime(endTime)}</span>
                    </div>
                  </div>
                )}
                {isOnLeave && todayShift?.leave?.reason && (
                  <p className="text-sm text-white/80 italic max-w-xs">
                    "{todayShift.leave.reason}"
                  </p>
                )}
              </div>
            </div>
          );
        })()
      }

      {/* Weekly Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <Card title="Weekly Schedule">
            <div className="space-y-2">
              {shifts.map((s) => (
                <div
                  key={s.day}
                  className={cn(
                    "flex items-center justify-between p-3 sm:p-4 rounded-xl transition-all",
                    s.isToday
                      ? "bg-primary/10 border-2 border-primary"
                      : s.holiday
                        ? "bg-warning/10 border border-warning/30"
                        : s.leave
                          ? "bg-accent/10 border border-accent/30"
                          : s.isWeekend
                            ? "bg-muted/50"
                            : "hover:bg-muted/50 border border-border"
                  )}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={cn(
                      "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex flex-col items-center justify-center shrink-0",
                      s.isToday
                        ? "bg-primary text-white"
                        : s.holiday
                          ? "bg-warning text-white"
                          : s.leave
                            ? "bg-accent text-white"
                            : s.isWeekend
                              ? "bg-muted text-foreground-secondary"
                              : "bg-surface border border-border"
                    )}>
                      <span className="text-[10px] sm:text-xs font-medium uppercase">
                        {s.shortDay}
                      </span>
                      <span className="text-sm sm:text-base font-bold">{s.date}</span>
                    </div>
                    <div>
                      <div className={cn(
                        "font-medium text-sm sm:text-base",
                        s.isToday ? "text-primary" : "text-foreground"
                      )}>
                        {s.day}
                        {s.isToday && (
                          <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                            Today
                          </span>
                        )}
                      </div>
                      <div className="text-xs sm:text-sm text-foreground-secondary">
                        {s.holiday ? (
                          <span className="flex items-center gap-1 text-warning font-medium">
                            <Sun className="w-3 h-3" />
                            {s.holiday}
                          </span>
                        ) : s.leave ? (
                          <span className="flex items-center gap-1 text-accent font-medium">
                            <Umbrella className="w-3 h-3" />
                            {s.leave.leaveType}
                          </span>
                        ) : s.isWeekend ? "Off Day" : "Regular Shift"}
                      </div>
                    </div>
                  </div>
                  <span className={cn(
                    "text-sm sm:text-base font-semibold",
                    s.holiday ? "text-warning" :
                      s.leave ? "text-accent" :
                        s.isWeekend ? "text-foreground-tertiary" :
                          s.isToday ? "text-primary" : "text-foreground"
                  )}>
                    {s.shift}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <Card title="Summary">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-foreground-secondary">Working Days</span>
                <span className="font-semibold">{7 - weeklyOff.length} days</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-foreground-secondary">Description</span>
                <span className="text-xs text-foreground-secondary font-medium">Regular {startTime}-{endTime} Shift</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-foreground-secondary">Off Days</span>
                <span className="font-semibold text-success">{weeklyOff.length} days</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-foreground-secondary">Location</span>
                <span className="font-semibold">{user?.location || "N/A"}</span>
              </div>
            </div>
          </Card>


        </div>
      </div>
    </div >
  );
};

export default Schedule;
