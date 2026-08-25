import React, { useState } from "react";
import { Clock, Calendar, Timer, Coffee } from "lucide-react";
import Card from "../../components/common/Card/Card";
import Button from "../../components/common/Button/Button";
import Modal from "../../components/common/Modal/Modal";
import { useAttendance } from "../../hooks/useAttendance";
import AttendanceHero from "../../components/features/attendance/AttendanceHero";
import StatCard from "../../components/common/Card/StatCard";
import ErrorAlert from "../../components/common/ErrorAlert";

import { cn } from "../../lib/utils";
import { formatDate, formatTime } from "../../utils/formatters";
import { attendanceService } from "../../services/attendanceService";
import type { BreakType } from "../../types/attendance";
import { Loader2 } from "lucide-react";



import { getDateInTimezone } from "../../utils/timezone";
// import { useQuery } from "@tanstack/react-query";
// import { attendanceService } from "../../services/attendanceService";
// import { useMemo } from "react";
// import type { AttendanceRecord } from "../../types/attendance";

const Attendance: React.FC = () => {

  const [isClockOutModalOpen, setIsClockOutModalOpen] = useState(false);
  const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);
  const [breakTypes, setBreakTypes] = useState<BreakType[]>([]);
  const [selectedBreakTypeId, setSelectedBreakTypeId] = useState<string>("");
  const [fetchingBreakTypes, setFetchingBreakTypes] = useState(false);

  const {
    status,
    lastActionTime,
    workingHoursFormatted,
    breakDurationFormatted,
    loading,
    initialLoading,
    error,
    setError,
    currentTime,
    actions,
    attendanceData,
  } = useAttendance();

  const confirmOut = async () => {
    setIsClockOutModalOpen(false);
    await actions.clockOut();
  };

  const handleOpenBreakModal = async () => {
    setIsBreakModalOpen(true);
    if (breakTypes.length === 0) {
      setFetchingBreakTypes(true);
      try {
        const resp = await attendanceService.getBreakTypes();
        if (resp.status === "success") {
          setBreakTypes(resp.data);
          setSelectedBreakTypeId(""); // Always start with "Select break type"
        }
      } catch (err) {
        console.error("Failed to fetch break types", err);
      } finally {
        setFetchingBreakTypes(false);
      }
    }
  };

  const handleStartBreak = async () => {
    if (!selectedBreakTypeId) return;
    const success = await actions.breakStart(selectedBreakTypeId);
    if (success) {
      setIsBreakModalOpen(false);
    }
  };

  const currentDateTz = getDateInTimezone(currentTime);
  const daysInMonth = new Date(currentDateTz.getFullYear(), currentDateTz.getMonth() + 1, 0).getDate();
  const workingDaysThisMonth = daysInMonth - (attendanceData?.monthlyOffDaysCount || 0) - (attendanceData?.monthlyHolidaysCount || 0);

  /* Removed history fetch - relying on monthlyAbsentDays from status response */

  const stats = [
    {
      label: "Today's Hours",
      value: workingHoursFormatted,
      icon: <Timer className="w-5 h-5" />,
      borderColor: "border-success",
      bgColor: "bg-success/10",
    },
    {
      label: "Total Breaks",
      value: `${attendanceData?.totalBreakDurationString || breakDurationFormatted} (${attendanceData?.totalBreakCount || 0})`,
      icon: <Coffee className="w-5 h-5" />,
      borderColor: "border-info",
      bgColor: "bg-info/10",
    },
    {
      label: "Working days This Month",
      value: workingDaysThisMonth.toString(),
      icon: <Calendar className="w-5 h-5" />,
      borderColor: "border-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Monthly Target",
      value: attendanceData?.monthlyTargetHours ? `${attendanceData.monthlyTargetHours}h` : "—",
      icon: <Clock className="w-5 h-5" />,
      borderColor: "border-warning",
      bgColor: "bg-warning/10",
    },
  ];


  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Attendance</h1>
        <div className="text-sm text-foreground-secondary">{formatDate(currentTime)}</div>
      </div>

      <ErrorAlert error={error} onClear={() => setError(null)} />

      <AttendanceHero
        status={status}
        currentTime={currentTime}
        lastActionTime={lastActionTime}
        workingHoursFormatted={workingHoursFormatted}
        breakDurationFormatted={breakDurationFormatted}
        loading={loading}
        initialLoading={initialLoading}
        onClockIn={actions.clockIn}
        onClockOut={() => setIsClockOutModalOpen(true)}
        onBreakStart={handleOpenBreakModal}
        onBreakResume={actions.breakResume}
        breakTypeName={attendanceData?.currentBreak?.breakType?.name}
        formatTime={formatTime}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <StatCard
            key={idx}
            title={stat.label}
            value={stat.value}
            icon={stat.icon}
            borderColor={stat.borderColor}
            bgColor={stat.bgColor}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card title="Today's Details">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-foreground-secondary">Date</span>
              <span className="font-medium text-sm">{formatDate(currentTime)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-foreground-secondary">Status</span>
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-semibold capitalize bg-muted text-foreground-secondary",
                status === "present" && "bg-success/10 text-success",
                status === "on_break" && "bg-info/10 text-info",
                status === "clock_out" && "bg-warning/10 text-warning",
              )}>
                {status?.replace("_", " ")}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-border">
              <span className="text-sm text-foreground-secondary">Last Action</span>
              <span className="font-medium text-sm">
                {lastActionTime ? formatTime(lastActionTime) : "—"}
              </span>
            </div>

            {status !== "clock_out" && status !== "not_clocked" && attendanceData?.currentSession && (
              <div className="pt-4 border-t border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground-secondary">Net Working Time</span>
                  <span className="font-medium text-sm text-primary">{attendanceData.currentSession.netDurationString || "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground-secondary">Break Duration</span>
                  <span className="font-medium text-sm text-warning">{attendanceData.currentSession.breakDurationString || "—"} ({attendanceData.currentSession.breakCount || 0})</span>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card title="This Week's Summary">
          <div className="space-y-3">
            {(() => {
              const daysMapping = [
                { short: "Mon", full: "Monday", dayIndex: 1 },
                { short: "Tue", full: "Tuesday", dayIndex: 2 },
                { short: "Wed", full: "Wednesday", dayIndex: 3 },
                { short: "Thu", full: "Thursday", dayIndex: 4 },
                { short: "Fri", full: "Friday", dayIndex: 5 },
                { short: "Sat", full: "Saturday", dayIndex: 6 },
                { short: "Sun", full: "Sunday", dayIndex: 0 },
              ];

              // Get Monday of current week
              const currentDay = currentDateTz.getDay();
              const diff = currentDateTz.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
              const monday = new Date(currentDateTz);
              monday.setDate(diff);

              return daysMapping
                .map((day, idx) => {
                  const date = new Date(monday);
                  date.setDate(monday.getDate() + idx);

                  // Only show days that belong to the current month
                  if (date.getMonth() !== currentDateTz.getMonth()) return null;

                  // Construct YYYY-MM-DD manually
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, "0");
                  const dayVal = String(date.getDate()).padStart(2, "0");
                  const dateStr = `${year}-${month}-${dayVal}`;

                  const isToday =
                    date.getDate() === currentDateTz.getDate() &&
                    date.getMonth() === currentDateTz.getMonth() &&
                    date.getFullYear() === currentDateTz.getFullYear();

                  const dateZero = new Date(date);
                  dateZero.setHours(0, 0, 0, 0);
                  const todayZero = new Date(currentDateTz);
                  todayZero.setHours(0, 0, 0, 0);
                  const isPast = dateZero < todayZero;

                  const isOffDay = attendanceData?.monthlyOffDays?.includes(dateStr);
                  const holiday = attendanceData?.monthlyHolidays?.find((h) => h.date === dateStr);
                  const leave = attendanceData?.monthlyLeaves?.find((l: any) => l.date === dateStr);

                  // Use robust logic based on available arrays
                  const isExplicitlyAbsent = attendanceData?.monthlyAbsentDays?.includes(dateStr);

                  // Priority logic
                  let displayStatus = "—";
                  let styleClass = "bg-muted text-foreground-secondary";
                  let textClass = "text-foreground-secondary";

                  if (leave) {
                    displayStatus = leave.isEarlyLeave ? "Early Leave" : "Leave";
                    styleClass = leave.isEarlyLeave ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive";
                    textClass = leave.isEarlyLeave ? "text-warning" : "text-destructive";
                  } else if (holiday) {
                    displayStatus = holiday.name;
                    styleClass = "bg-purple-500/10 text-purple-500";
                    textClass = "text-purple-500";
                  } else if (isExplicitlyAbsent) {
                    displayStatus = "Absent";
                    styleClass = "bg-destructive/10 text-destructive";
                    textClass = "text-destructive";
                  } else if (isOffDay) {
                    displayStatus = "Off Day";
                    styleClass = "bg-warning/10 text-warning";
                    textClass = "text-warning";
                  } else if (isToday) {
                    displayStatus = workingHoursFormatted;
                    styleClass = "bg-primary text-white";
                    textClass = "text-primary";
                  } else if (isPast) {
                    // If past and not any of the above, assume Present
                    displayStatus = "Present";
                    styleClass = "bg-success/10 text-success";
                    textClass = "text-success";
                  }

                  return (
                    <div
                      key={day.short}
                      className={cn(
                        "group relative flex items-center justify-between py-2 rounded-lg px-3 transition-colors",
                        isToday ? "bg-primary/5 border border-primary/20" : "",
                        isPast ? "opacity-90" : "",
                        // Apply background logic for the whole row slightly if needed, or just keep mapped styles
                        // Using the derived styleClass for the badge/icon area mostly
                        leave ? "bg-destructive/5" : "",
                        holiday ? "bg-purple-500/5" : "",
                        isExplicitlyAbsent ? "bg-destructive/5" : "",
                        displayStatus === "Present" && !isToday ? "bg-success/5" : "",
                        isOffDay && !isToday ? "bg-muted/30" : ""
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold",
                            styleClass
                          )}
                        >
                          {day.short.charAt(0)}
                        </span>
                        <div className="flex flex-col">
                          <span
                            className={cn(
                              "font-medium text-sm",
                              textClass
                            )}
                          >
                            {day.short}
                          </span>
                          <span className="text-[10px] text-foreground-secondary opacity-60">
                            {date.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-sm font-medium",
                            textClass
                          )}
                        >
                          {displayStatus}
                          {leave?.isEarlyLeave && leave?.requestedHours ?  (h) : ''}
                        </span>
                        
                        {/* Tooltip for Leave Comment */}
                        {leave && (
                          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 w-48 p-2 bg-surface border border-border rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-xs">
                            <p className="font-semibold mb-1">Approval Comment:</p>
                            <p className="text-foreground-secondary break-words">{leave.approvalComment || "Approved"}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
                .filter(Boolean);
            })()}
          </div>
        </Card>

      </div>

      <Modal
        open={isClockOutModalOpen}
        onClose={() => setIsClockOutModalOpen(false)}
        title="Confirm Clock Out"
        maxWidth="sm"
        actions={
          <>
            <Button variant="ghost" onClick={() => setIsClockOutModalOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmOut} disabled={loading}>
              Clock Out
            </Button>
          </>
        }
      >
        <p className="text-foreground-secondary">
          Are you sure you want to clock out? This will end your session for today.
        </p>
      </Modal>

      <Modal
        open={isBreakModalOpen}
        onClose={() => setIsBreakModalOpen(false)}
        title="Select Break Type"
        maxWidth="sm"
        actions={
          <>
            <Button variant="ghost" onClick={() => setIsBreakModalOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button 
              variant="default" 
              onClick={handleStartBreak} 
              disabled={loading || fetchingBreakTypes || !selectedBreakTypeId}
              startIcon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Coffee className="w-4 h-4" />}
            >
              Start Break
            </Button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          <p className="text-sm text-foreground-secondary">
            Please select the type of break you are taking.
          </p>
          
          {fetchingBreakTypes ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-2">
              <label htmlFor="breakType" className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary">
                Break Type
              </label>
              <select
                id="breakType"
                value={selectedBreakTypeId}
                onChange={(e) => setSelectedBreakTypeId(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              >
                <option value="" disabled>Select break type</option>
                {breakTypes.length === 0 ? (
                  <option value="" disabled>No break types available</option>
                ) : (
                  breakTypes.map((bt) => (
                    <option key={bt._id} value={bt._id}>
                      {bt.name} {bt.maxDuration > 0 ? `(${bt.maxDuration} mins max)` : ""}
                    </option>
                  ))
                )}
              </select>
            </div>
          )}
        </div>
      </Modal>

    </div>
  );
};

export default Attendance;




