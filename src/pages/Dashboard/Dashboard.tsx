import React, { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TrendingUp, Clock, Calendar, LogIn, Loader2, Coffee, Timer, Megaphone, Hourglass } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAppSelector } from "../../store/hooks";
import Modal from "../../components/common/Modal/Modal";
import Button from "../../components/common/Button/Button";
import { useAttendance } from "../../hooks/useAttendance";
import AttendanceHero from "../../components/features/attendance/AttendanceHero";
import StatCard from "../../components/common/Card/StatCard";
import ErrorAlert from "../../components/common/ErrorAlert";
import { formatTime, formatShortDate } from "../../utils/formatters";
import { getDateInTimezone } from "../../utils/timezone";
import { employeeService, type RecentActivity } from "../../services/employeeService";
import { attendanceService } from "../../services/attendanceService";
import type { BreakType } from "../../types/attendance";
import type { CustomAxiosConfig } from "../../services/api";


import AnnouncementMarquee from "../../components/features/announcements/AnnouncementMarquee";



const Dashboard: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const { refreshTrigger } = useAppSelector((state) => state.notification);
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

  const queryClient = useQueryClient();

  // Timezone-aware today date string (YYYY-MM-DD)
  const todayStr = React.useMemo(() => {
    const tzDate = getDateInTimezone(currentTime);
    const year = tzDate.getFullYear();
    const month = String(tzDate.getMonth() + 1).padStart(2, "0");
    const day = String(tzDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, [currentTime]);

  const {
    data: activities = [],
    isLoading: activitiesLoading,
    // refetch: fetchActivities
  } = useQuery({
    queryKey: ["recent-activities", todayStr, refreshTrigger],
    queryFn: async () => {
      const config: CustomAxiosConfig = { skipLoading: true };
      const resp = await employeeService.getRecentActivity({
        date: todayStr
      }, config);

      if (resp.success && resp.data) {
        let activitiesArray: RecentActivity[] = [];

        if (Array.isArray(resp.data)) {
          activitiesArray = resp.data;
        } else if (resp.data.activities && Array.isArray(resp.data.activities)) {
          activitiesArray = resp.data.activities;
        }

        // Reverse to show most recent first
        return [...activitiesArray].reverse();
      }
      return [];
    },
    staleTime: 60000, // 1 minute
  });

  const confirmOut = useCallback(async () => {
    setIsClockOutModalOpen(false);
    const success = await actions.clockOut();
    if (success) {
      queryClient.invalidateQueries({ queryKey: ["recent-activities"] });
    }
  }, [actions, queryClient]);

  const handleClockIn = useCallback(async () => {
    const success = await actions.clockIn();
    if (success) {
      queryClient.invalidateQueries({ queryKey: ["recent-activities"] });
    }
  }, [actions, queryClient]);

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

  const handleBreakStart = useCallback(async () => {
    if (!selectedBreakTypeId) return;
    const success = await actions.breakStart(selectedBreakTypeId);
    if (success) {
      setIsBreakModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["recent-activities"] });
    }
  }, [actions, queryClient, selectedBreakTypeId]);

  const handleBreakResume = useCallback(async () => {
    const success = await actions.breakResume();
    if (success) {
      queryClient.invalidateQueries({ queryKey: ["recent-activities"] });
    }
  }, [actions, queryClient]);


  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Welcome back, {user?.firstName || "User"}!
          </h1>
          <p className="text-sm text-foreground-secondary mt-1">
            Here's what's happening with your work today.
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* <button className="p-2 text-foreground-secondary hover:bg-muted rounded-full transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
          </button> */}
          {/* <div className="h-8 w-px bg-border hidden sm:block"></div> */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-xs sm:text-sm font-medium text-foreground">
              {formatShortDate(currentTime)}
            </span>
          </div>
        </div>
      </div>

      <ErrorAlert error={error} onClear={() => setError(null)} />

      {/* Attendance Hero */}
      <AttendanceHero
        status={status}
        currentTime={currentTime}
        lastActionTime={lastActionTime}
        workingHoursFormatted={workingHoursFormatted}
        breakDurationFormatted={breakDurationFormatted}
        loading={loading}
        initialLoading={initialLoading}
        onClockIn={handleClockIn}
        onClockOut={() => setIsClockOutModalOpen(true)}
        onBreakStart={handleOpenBreakModal}
        onBreakResume={handleBreakResume}
        breakTypeName={attendanceData?.currentBreak?.breakType?.name}
        formatTime={formatTime}
      />

      {/* Announcements Marquee */}
      <AnnouncementMarquee />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Working Hours"
          value={workingHoursFormatted}
          icon={<Clock className="w-5 h-5 sm:w-6 sm:h-6" />}
          trend={{ value: "12% from yesterday", positive: true }}
          borderColor="border-success"
          bgColor="bg-success/10"
        />
        <StatCard
          title="Total Breaks"
          value={`${attendanceData?.totalBreakCount || 0} Sessions`}
          icon={<Coffee className="w-5 h-5 sm:w-6 sm:h-6" />}
          trend={{ value: "2 more than yesterday", positive: false }}
          borderColor="border-info"
          bgColor="bg-info/10"
        />
        <StatCard
          title="Break Duration"
          value={attendanceData?.totalBreakDurationString || breakDurationFormatted}
          icon={<Timer className="w-5 h-5 sm:w-6 sm:h-6" />}
          borderColor="border-warning"
          bgColor="bg-warning/10"
        />
        <StatCard
          title="Monthly Overtime"
          value={attendanceData?.monthlyOvertimeString || "0h 0m"}
          icon={<Hourglass className="w-5 h-5 sm:w-6 sm:h-6" />}
          trend={{ value: "This month", positive: true }}
          borderColor="border-primary"
          bgColor="bg-primary/10"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-surface p-4 sm:p-6 rounded-2xl shadow-sm border border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg text-foreground">Recent Activity</h2>
            {/* <button className="text-sm text-primary font-medium hover:underline">
              View All
            </button> */}
          </div>
          <div className="space-y-6 h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {activitiesLoading ? (
              <div className="flex flex-col items-center justify-center py-10 text-foreground-secondary">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p className="text-sm italic">Updating activity log...</p>
              </div>
            ) : activities.length > 0 ? (
              activities.map((activity, idx) => (
                <div key={idx} className="flex items-center gap-4 group">
                  <div className="relative">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center relative z-10 transition-transform group-hover:scale-110",
                        activity.type.includes("CLOCK_IN") || activity.type.includes("RESUME")
                          ? "bg-success/10 text-success"
                          : activity.type.includes("CLOCK_OUT") || activity.type.includes("REJECTED")
                            ? "bg-warning/10 text-warning"
                            : activity.type.includes("APPLIED")
                              ? "bg-primary/10 text-primary"
                              : activity.type.includes("ANNOUNCEMENT")
                                ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                                : "bg-info/10 text-info"
                      )}
                    >
                      {activity.type.includes("CLOCK") ? (
                        <LogIn className="w-5 h-5" />
                      ) : activity.type.includes("REIMBURSEMENT") ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : activity.type.includes("ANNOUNCEMENT") ? (
                        <Megaphone className="w-5 h-5" />
                      ) : (
                        <Coffee className="w-5 h-5" />
                      )}
                    </div>
                    {idx !== activities.length - 1 && (
                      <div className="absolute top-10 left-1/2 w-0.5 h-6 bg-border -translate-x-1/2"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">
                        {activity.title}
                      </span>
                      <span className="text-xs text-foreground-secondary bg-muted px-2 py-0.5 rounded-full font-medium">
                        {formatTime(new Date(activity.timestamp))}
                      </span>
                    </div>
                    {activity.description && (
                      <p className="text-sm text-foreground-secondary mt-0.5">
                        {activity.description}
                      </p>
                    )}
                  </div>
                </div>

              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-foreground-secondary border-2 border-dashed border-border rounded-xl bg-muted/20">
                <Clock className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm">No activity recorded for today yet.</p>
              </div>
            )}
          </div>

        </div>

        {/* Quick Actions / Status */}
        <div className="bg-surface p-4 sm:p-6 rounded-2xl shadow-sm border border-border">
          <h2 className="font-bold text-lg text-foreground mb-6">
            Quick Summary
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
              <p className="text-sm text-foreground-secondary mb-1">Shift Type</p>
              <p className="font-bold text-foreground flex items-center gap-2">
                Morning Session <span className="w-2 h-2 rounded-full bg-success"></span>
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
              <p className="text-sm text-foreground-secondary mb-1">Weekly Off</p>
              <p className="font-bold text-foreground">Saturday, Sunday</p>
            </div>
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-primary">Monthly Attendance</span>
                <span className="text-xs font-bold text-primary">
                  {attendanceData?.monthlyAttendancePercentage ?? 0}%
                </span>
              </div>
              <div className="w-full bg-primary/10 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${attendanceData?.monthlyAttendancePercentage ?? 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clock Out Confirmation Modal */}
      <Modal
        open={isClockOutModalOpen}
        onClose={() => setIsClockOutModalOpen(false)}
        title="Confirm Clock Out"
        maxWidth="sm"
        actions={
          <>
            <Button
              variant="ghost"
              onClick={() => setIsClockOutModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmOut}
              disabled={loading}
              startIcon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            >
              Clock Out
            </Button>
          </>
        }
      >
        <p className="text-foreground-secondary">
          Are you sure you want to clock out? This will end your working session for today.
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
              onClick={handleBreakStart} 
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
              <label htmlFor="breakType-dashboard" className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary">
                Break Type
              </label>
              <select
                id="breakType-dashboard"
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


export default Dashboard;
