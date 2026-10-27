import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Coffee,
  Gift,
  XCircle,
  Info,
  CalendarDays,
  List,
  LogIn,
  LogOut
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  getDay
} from "date-fns";
import { attendanceService } from "../../../services/attendanceService";
import { holidayService } from "../../../services/holidayService";
import { leaveService } from "../../../services/leaveService";
import { useAttendance } from "../../../hooks/useAttendance";
import { cn } from "../../../lib/utils";

interface MonthlyAttendanceCalendarProps {
  onSelectDayDetails?: (dateStr: string) => void;
}

export const MonthlyAttendanceCalendar: React.FC<MonthlyAttendanceCalendarProps> = () => {
  const {
    attendanceData,
    currentTime,
    status: todayStatus,
    workingHoursFormatted,
    lastActionTime,
  } = useAttendance();

  // Active viewed month
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date(currentTime));
  // Selected day for the details card
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => new Date(currentTime));
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  // View mode: 'calendar' or 'list'
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDateStr = format(monthStart, "yyyy-MM-dd");
  const endDateStr = format(monthEnd, "yyyy-MM-dd");

  const isViewingCurrentMonth = isSameMonth(currentMonth, currentTime);

  // Fetch individual attendance records for the selected month
  const { data: memberAttendanceData } = useQuery({
    queryKey: ["member-monthly-attendance", startDateStr, endDateStr],
    queryFn: () =>
      attendanceService.getMemberAttendance({
        startDate: startDateStr,
        endDate: endDateStr,
        limit: 100,
      }),
    staleTime: 60000,
  });

  // Fetch holidays for the selected month
  const { data: holidaysResp } = useQuery({
    queryKey: ["monthly-holidays", startDateStr, endDateStr],
    queryFn: () => holidayService.getAll({ startDate: startDateStr, endDate: endDateStr, limit: 50 }).catch(() => null),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch leaves for the selected month
  const { data: leavesResp } = useQuery({
    queryKey: ["monthly-leaves", startDateStr, endDateStr],
    queryFn: () => leaveService.getMyRequests({ startDate: startDateStr, endDate: endDateStr, status: "approved" }).catch(() => null),
    staleTime: 5 * 60 * 1000,
  });

  const attendanceRecordsMap = useMemo(() => {
    const map = new Map<string, any>();
    const rawList =
      memberAttendanceData?.data?.attendance ||
      memberAttendanceData?.data?.attendances ||
      memberAttendanceData?.attendance ||
      memberAttendanceData?.attendances ||
      (Array.isArray(memberAttendanceData?.data) ? memberAttendanceData.data : []);

    const records = Array.isArray(rawList) ? rawList : [];

    records.forEach((rec: any) => {
      const dateKeys = new Set<string>();

      if (rec.dateStr) {
        dateKeys.add(rec.dateStr);
      }
      if (typeof rec.date === "string") {
        dateKeys.add(rec.date.slice(0, 10));
        try {
          dateKeys.add(format(new Date(rec.date), "yyyy-MM-dd"));
        } catch (_) {}
      } else if (rec.date) {
        try {
          dateKeys.add(format(new Date(rec.date), "yyyy-MM-dd"));
        } catch (_) {}
      }

      // Check sessions or checkIn time
      const checkInTime = rec.checkIn?.time || rec.sessions?.[0]?.checkIn?.time;
      if (checkInTime) {
        try {
          dateKeys.add(format(new Date(checkInTime), "yyyy-MM-dd"));
        } catch (_) {}
      }

      dateKeys.forEach((key) => {
        if (key && key.length === 10) {
          map.set(key, rec);
        }
      });
    });

    return map;
  }, [memberAttendanceData]);

  const holidaysMap = useMemo(() => {
    const map = new Map<string, any>();
    const list = holidaysResp?.data || [];
    if (Array.isArray(list)) {
      list.forEach((h: any) => {
        const dStr = typeof h.date === "string" ? h.date.slice(0, 10) : format(new Date(h.date), "yyyy-MM-dd");
        map.set(dStr, h);
      });
    }
    if (isViewingCurrentMonth && Array.isArray(attendanceData?.monthlyHolidays)) {
      attendanceData.monthlyHolidays.forEach((h: any) => {
        if (h.date) map.set(h.date, h);
      });
    }
    return map;
  }, [holidaysResp, isViewingCurrentMonth, attendanceData]);

  const leavesMap = useMemo(() => {
    const map = new Map<string, any>();
    const list = (leavesResp as any)?.data || (leavesResp as any)?.leaves || (Array.isArray(leavesResp) ? leavesResp : []);
    if (Array.isArray(list)) {
      list.forEach((l: any) => {
        if (l.startDate && l.endDate) {
          try {
            const start = new Date(l.startDate);
            const end = new Date(l.endDate);
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
              map.set(format(d, "yyyy-MM-dd"), l);
            }
          } catch (_) {}
        } else if (l.date) {
          map.set(l.date, l);
        }
      });
    }
    if (isViewingCurrentMonth && Array.isArray(attendanceData?.monthlyLeaves)) {
      attendanceData.monthlyLeaves.forEach((l: any) => {
        if (l.date) map.set(l.date, l);
      });
    }
    return map;
  }, [leavesResp, isViewingCurrentMonth, attendanceData]);

  // Days in month
  const daysInMonth = monthEnd.getDate();

  // Monday-based offset (0 = Mon, ..., 6 = Sun)
  const startDayOfWeek = (getDay(monthStart) + 6) % 7;

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  const handleToday = () => {
    const today = new Date(currentTime);
    setCurrentMonth(today);
    setSelectedDate(today);
    setIsDetailsOpen(true);
  };

  // Compute month days array
  const monthDays = useMemo(() => {
    const days = [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = format(date, "yyyy-MM-dd");
      const dayOfWeek = (getDay(date) + 6) % 7; // 0 = Mon, 5 = Sat, 6 = Sun
      const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Sat or Sun

      const isCurrentDay = isSameDay(date, currentTime);

      const dateZero = new Date(date);
      dateZero.setHours(0, 0, 0, 0);
      const todayZero = new Date(currentTime);
      todayZero.setHours(0, 0, 0, 0);
      const isPast = dateZero < todayZero;

      // Check holidays
      const holiday = holidaysMap.get(dateStr);

      // Check leaves
      const leave = leavesMap.get(dateStr);

      // Check attendance records
      const record = attendanceRecordsMap.get(dateStr);

      // Check if employee worked on this day from record
      const recordHasWorked = Boolean(
        record &&
        (
          record.status === "present" ||
          record.status === "half-day" ||
          record.status === "late" ||
          record.status === "weekend" ||
          (typeof record.totalHours === "number" && record.totalHours > 0) ||
          (typeof record.durationMs === "number" && record.durationMs > 0) ||
          (Array.isArray(record.sessions) && record.sessions.length > 0 && record.sessions.some((s: any) => s.checkIn?.time)) ||
          Boolean(record.checkIn?.time)
        )
      );

      // Today's specific attendance states
      const isTodayActiveWorking =
        isCurrentDay &&
        (todayStatus === "present" || todayStatus === "on_break") &&
        Boolean(workingHoursFormatted && workingHoursFormatted !== "0h 0m");

      const isTodayClockedOut =
        isCurrentDay &&
        todayStatus === "clock_out" &&
        Boolean(
          (workingHoursFormatted && workingHoursFormatted !== "0h 0m") ||
          (attendanceData?.totalHours && attendanceData.totalHours > 0) ||
          attendanceData?.currentSession?.checkOut?.time ||
          recordHasWorked
        );

      const hasWorked = isCurrentDay
        ? (isTodayActiveWorking || isTodayClockedOut || recordHasWorked)
        : recordHasWorked;

      let workedDurationStr = "";
      if (isCurrentDay) {
        if (isTodayActiveWorking) {
          workedDurationStr = (workingHoursFormatted && workingHoursFormatted !== "0h 0m") ? workingHoursFormatted : "Ongoing";
        } else {
          workedDurationStr =
            (workingHoursFormatted && workingHoursFormatted !== "0h 0m" ? workingHoursFormatted : null) ||
            record?.netDurationString ||
            record?.totalDurationString ||
            (record?.totalHours ? `${record.totalHours}h` : null) ||
            (attendanceData?.totalDurationString && attendanceData.totalDurationString !== "0S" ? attendanceData.totalDurationString : null) ||
            (attendanceData?.totalHours ? `${attendanceData.totalHours}h` : null) ||
            "Completed";
        }
      } else if (record) {
        workedDurationStr =
          record.netDurationString ||
          record.totalDurationString ||
          (record.totalHours ? `${record.totalHours}h` : null) ||
          record.sessions?.[0]?.durationString ||
          "Worked";
      }

      let type: "today" | "present" | "absent" | "off_day" | "holiday" | "leave" | "future" = "future";
      let pillText = "—";
      let statusLabel = "—";
      let recordedHoursOrNote = "—";

      if (hasWorked) {
        type = isCurrentDay ? "today" : "present";
        statusLabel = record?.status === "half-day" ? "HALF DAY" : "PRESENT";
        pillText = workedDurationStr.toUpperCase();
        recordedHoursOrNote = isCurrentDay && isTodayActiveWorking
          ? `${workedDurationStr} (Ongoing)`
          : `${workedDurationStr} (Worked)${record?.isEarlyLeave ? " • Early Leave" : ""}`;
      } else if (leave) {
        type = "leave";
        statusLabel = leave.isEarlyLeave ? "Early Leave" : "Leave";
        pillText = leave.isEarlyLeave ? "Early Leave" : "Leave";
        recordedHoursOrNote = leave.approvalComment || leave.reason || "Approved Leave";
      } else if (holiday) {
        type = "holiday";
        statusLabel = "HOLIDAY";
        pillText = holiday.name || "Holiday";
        recordedHoursOrNote = holiday.name;
      } else if (isWeekend) {
        type = "off_day";
        statusLabel = "OFF DAY";
        pillText = "Off Day";
        recordedHoursOrNote = "Weekly Off";
      } else if (isCurrentDay) {
        type = "today";
        statusLabel = "TODAY";
        pillText = "Not Clocked In";
        recordedHoursOrNote = "Not Clocked In";
      } else if (isPast) {
        type = "absent";
        statusLabel = "ABSENT";
        pillText = "Absent";
        recordedHoursOrNote = "Absent";
      } else {
        type = "future";
        statusLabel = "SCHEDULED";
        pillText = "—";
        recordedHoursOrNote = "Scheduled shift";
      }

      days.push({
        day,
        date,
        dateStr,
        isWeekend,
        isCurrentDay,
        hasWorked,
        type,
        pillText,
        statusLabel,
        recordedHoursOrNote,
        record,
      });
    }

    return days;
  }, [
    currentMonth,
    daysInMonth,
    attendanceRecordsMap,
    holidaysMap,
    leavesMap,
    attendanceData,
    currentTime,
    todayStatus,
    workingHoursFormatted,
  ]);

  // Compute stat counts
  const stats = useMemo(() => {
    const presentCount = monthDays.filter((d) => d.type === "present" || (d.type === "today" && d.hasWorked)).length;
    const offDaysCount = monthDays.filter((d) => d.type === "off_day").length;
    const holidaysCount = monthDays.filter((d) => d.type === "holiday").length;
    const absentCount = monthDays.filter((d) => d.type === "absent").length;
    const leavesCount = monthDays.filter((d) => d.type === "leave").length;

    return {
      present: presentCount,
      offDays: offDaysCount,
      holidays: holidaysCount,
      leavesAbsent: absentCount + leavesCount,
      totalDays: daysInMonth,
    };
  }, [monthDays, daysInMonth]);

  // Selected day object
  const activeSelectedDay = useMemo(() => {
    if (!selectedDate) return null;
    const dStr = format(selectedDate, "yyyy-MM-dd");
    return monthDays.find((d) => d.dateStr === dStr) || null;
  }, [selectedDate, monthDays]);

  return (
    <div className="bg-white border border-slate-200 rounded-[24px] shadow-sm p-4 sm:p-6 lg:p-7 space-y-6">
      {/* Month Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Calendar Icon, Month Title & Subtitle */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
            <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Monthly Attendance & Shift Breakdown
            </p>
          </div>
        </div>

        {/* Right: Controls (< Today >, Calendar/Day List) */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Navigation buttons: < Today > */}
          <div className="flex items-center bg-slate-50 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={handlePrevMonth}
              aria-label="Previous Month"
              className="p-2 rounded-lg text-slate-700 hover:text-slate-950 hover:bg-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-800 hover:bg-white transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              aria-label="Next Month"
              className="p-2 rounded-lg text-slate-700 hover:text-slate-950 hover:bg-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* View toggle buttons: Calendar / Day List */}
          <div className="flex items-center bg-slate-50 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode("calendar")}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                viewMode === "calendar"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white"
              )}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Calendar
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                viewMode === "list"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white"
              )}
            >
              <List className="w-3.5 h-3.5" />
              Day List
            </button>
          </div>
        </div>
      </div>

      {/* 5 Stat Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5">
        {/* PRESENT */}
        <div className="bg-[#f0fdf4] border-2 border-[#bbf7d0] rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-full bg-[#dcfce7] flex items-center justify-center text-[#16a34a] shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#15803d] block">
              PRESENT
            </span>
            <span className="text-sm sm:text-base font-black text-[#14532d]">
              {stats.present} days
            </span>
          </div>
        </div>

        {/* OFF DAYS */}
        <div className="bg-[#fffbeb] border-2 border-[#fde68a] rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-full bg-[#fef3c7] flex items-center justify-center text-[#d97706] shrink-0">
            <Coffee className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#b45309] block">
              OFF DAYS
            </span>
            <span className="text-sm sm:text-base font-black text-[#78350f]">
              {stats.offDays} days
            </span>
          </div>
        </div>

        {/* HOLIDAYS */}
        <div className="bg-[#faf5ff] border-2 border-[#e9d5ff] rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-full bg-[#f3e8ff] flex items-center justify-center text-[#9333ea] shrink-0">
            <Gift className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#7e22ce] block">
              HOLIDAYS
            </span>
            <span className="text-sm sm:text-base font-black text-[#581c87]">
              {stats.holidays} days
            </span>
          </div>
        </div>

        {/* LEAVES / ABSENT */}
        <div className="bg-[#fff1f2] border-2 border-[#fecdd3] rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-full bg-[#ffe4e6] flex items-center justify-center text-[#e11d48] shrink-0">
            <XCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#be123c] block">
              LEAVES / ABSENT
            </span>
            <span className="text-sm sm:text-base font-black text-[#881337]">
              {stats.leavesAbsent} days
            </span>
          </div>
        </div>

        {/* TOTAL DAYS */}
        <div className="bg-[#f0f9ff] border-2 border-[#bae6fd] rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 col-span-2 sm:col-span-1 shadow-2xs">
          <div className="w-9 h-9 rounded-full bg-[#e0f2fe] flex items-center justify-center text-[#0284c7] shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#0369a1] block">
              TOTAL DAYS
            </span>
            <span className="text-sm sm:text-base font-black text-[#0c4a6e]">
              {stats.totalDays} days
            </span>
          </div>
        </div>
      </div>

      {viewMode === "calendar" ? (
        /* Calendar Grid View */
        <div className="space-y-3">
          {/* Day of week column headers */}
          <div className="grid grid-cols-7 gap-2.5 sm:gap-3 text-center pb-1">
            {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day, idx) => (
              <div
                key={day}
                className={cn(
                  "py-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider",
                  idx >= 5
                    ? "text-[#ea580c]"
                    : "text-[#334155]"
                )}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Month Day Grid */}
          <div className="grid grid-cols-7 gap-2.5 sm:gap-3">
            {/* Blank offset cells for days before the 1st of the month */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div
                key={`offset-${i}`}
                className="min-h-[100px] sm:min-h-[110px] rounded-[18px] border border-transparent p-2 opacity-0 pointer-events-none"
              />
            ))}

            {/* Days of the month */}
            {monthDays.map((item) => {
              const isSelected = selectedDate && isSameDay(selectedDate, item.date);

              return (
                <button
                  key={item.dateStr}
                  type="button"
                  onClick={() => {
                    setSelectedDate(item.date);
                    setIsDetailsOpen(true);
                  }}
                  className={cn(
                    "min-h-[100px] sm:min-h-[110px] rounded-[18px] p-2.5 sm:p-3 flex flex-col justify-between text-left transition-all duration-200 cursor-pointer focus:outline-none",
                    // Today Styling (Vibrant Blue)
                    item.type === "today" &&
                      "border-2 border-[#2563eb] bg-[#eff6ff] shadow-sm",
                    // Absent Styling (Crisp Soft Rose)
                    item.type === "absent" &&
                      "border-2 border-[#fecdd3] bg-[#fff1f2] hover:border-[#fda4af]",
                    // Present Styling (Crisp Soft Mint)
                    item.type === "present" &&
                      "border-2 border-[#bbf7d0] bg-[#f0fdf4] hover:border-[#86efac]",
                    // Off Day Styling (Crisp Soft Amber)
                    item.type === "off_day" &&
                      "border-2 border-[#fde68a] bg-[#fffbeb] hover:border-[#fcd34d]",
                    // Holiday Styling (Crisp Soft Lavender)
                    item.type === "holiday" &&
                      "border-2 border-[#e9d5ff] bg-[#faf5ff] hover:border-[#d8b4fe]",
                    // Leave Styling
                    item.type === "leave" &&
                      "border-2 border-[#fecdd3] bg-[#fff1f2] hover:border-[#fda4af]",
                    // Future Weekday Styling (Pure Crisp White)
                    item.type === "future" &&
                      "border-2 border-[#e2e8f0] bg-white hover:border-slate-300 hover:shadow-2xs",
                    // Selection Ring
                    isSelected && "ring-2 ring-blue-600 ring-offset-2"
                  )}
                >
                  {/* Top row: Day Number & Today Pill */}
                  <div className="flex items-center justify-between w-full">
                    {item.type === "today" ? (
                      <span className="w-6 h-6 rounded-full bg-[#1d4ed8] text-white flex items-center justify-center text-xs font-black shadow-xs">
                        {item.day}
                      </span>
                    ) : (
                      <span className="text-xs sm:text-sm font-extrabold text-[#0f172a] pl-0.5">
                        {item.day}
                      </span>
                    )}

                    {item.type === "today" && (
                      <span className="bg-[#2563eb] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                        TODAY
                      </span>
                    )}
                  </div>

                  {/* Bottom: White Capsule Pill */}
                  <div className="w-full pt-1">
                    <div
                      className={cn(
                        "w-full rounded-full py-1 sm:py-1.5 px-2 text-center text-[11px] sm:text-xs font-bold truncate transition-all shadow-[0_1px_2px_rgba(0,0,0,0.04)] bg-white",
                        item.type === "today" &&
                          (item.hasWorked
                            ? "border-2 border-[#bbf7d0] text-[#15803d]"
                            : "border-2 border-[#bfdbfe] text-[#1d4ed8]"),
                        item.type === "absent" &&
                          "border-2 border-[#fecdd3] text-[#dc2626]",
                        item.type === "present" &&
                          "border-2 border-[#bbf7d0] text-[#15803d]",
                        item.type === "off_day" &&
                          "border-2 border-[#fde68a] text-[#b45309]",
                        item.type === "holiday" &&
                          "border-2 border-[#e9d5ff] text-[#7e22ce]",
                        item.type === "leave" &&
                          "border-2 border-[#fecdd3] text-[#dc2626]",
                        item.type === "future" &&
                          "border-2 border-[#e2e8f0] text-[#334155] font-black text-sm"
                      )}
                    >
                      {item.pillText}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Day List View */
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 uppercase text-[10px] sm:text-xs font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Day</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Recorded Time / Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthDays.map((item) => {
                  const isSelected = selectedDate && isSameDay(selectedDate, item.date);
                  return (
                    <tr
                      key={item.dateStr}
                      onClick={() => {
                        setSelectedDate(item.date);
                        setIsDetailsOpen(true);
                      }}
                      className={cn(
                        "hover:bg-slate-50 cursor-pointer transition-colors",
                        isSelected && "bg-blue-50/70",
                        item.type === "today" && "font-semibold"
                      )}
                    >
                      <td className="py-3 px-4 text-slate-900 font-semibold">
                        {format(item.date, "MMM dd, yyyy")}
                      </td>
                      <td
                        className={cn(
                          "py-3 px-4 font-bold",
                          item.isWeekend
                            ? "text-[#ea580c]"
                            : "text-[#334155]"
                        )}
                      >
                        {format(item.date, "EEEE")}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block",
                            item.type === "today" && (item.hasWorked ? "bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0]" : "bg-blue-100 text-blue-800 border border-blue-200"),
                            item.type === "present" && "bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0]",
                            item.type === "absent" && "bg-[#fff1f2] text-[#dc2626] border border-[#fecdd3]",
                            item.type === "off_day" && "bg-[#fffbeb] text-[#b45309] border border-[#fde68a]",
                            item.type === "holiday" && "bg-[#faf5ff] text-[#7e22ce] border border-[#e9d5ff]",
                            item.type === "leave" && "bg-[#fff1f2] text-[#dc2626] border border-[#fecdd3]",
                            item.type === "future" && "bg-slate-100 text-slate-700 border border-slate-200"
                          )}
                        >
                          {item.statusLabel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-800 font-semibold">
                        {item.recordedHoursOrNote}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Selected Day Details Card (Bottom) */}
      {isDetailsOpen && activeSelectedDay && (
        <div className="border-t border-slate-200 pt-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb] inline-block" />
              <h3 className="text-sm font-bold text-[#0f172a]">
                Selected Day Details
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsDetailsOpen(false)}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            {/* Date */}
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Date
              </span>
              <span className="text-sm font-black text-[#0f172a]">
                {format(activeSelectedDay.date, "EEEE, MMMM d, yyyy")}
              </span>
            </div>

            {/* Status */}
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Status
              </span>
              <span
                className={cn(
                  "px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block",
                  activeSelectedDay.type === "today" &&
                    (activeSelectedDay.hasWorked ? "bg-[#f0fdf4] text-[#15803d] border-2 border-[#bbf7d0]" : "bg-[#eff6ff] text-[#1d4ed8] border-2 border-[#bfdbfe]"),
                  activeSelectedDay.type === "present" &&
                    "bg-[#f0fdf4] text-[#15803d] border-2 border-[#bbf7d0]",
                  activeSelectedDay.type === "absent" &&
                    "bg-[#fff1f2] text-[#dc2626] border-2 border-[#fecdd3]",
                  activeSelectedDay.type === "off_day" &&
                    "bg-[#fffbeb] text-[#b45309] border-2 border-[#fde68a]",
                  activeSelectedDay.type === "holiday" &&
                    "bg-[#faf5ff] text-[#7e22ce] border-2 border-[#e9d5ff]",
                  activeSelectedDay.type === "leave" &&
                    "bg-[#fff1f2] text-[#dc2626] border-2 border-[#fecdd3]",
                  activeSelectedDay.type === "future" &&
                    "bg-slate-100 text-slate-700 border-2 border-slate-200"
                )}
              >
                {activeSelectedDay.statusLabel}
              </span>
            </div>

            {/* Recorded Hours / Note */}
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Recorded Hours / Note
              </span>
              <span className="text-sm font-black text-[#0f172a]">
                {activeSelectedDay.recordedHoursOrNote}
              </span>
            </div>
          </div>

          {/* Optional detailed session row if session check-in/out data exists */}
          {((activeSelectedDay.record && (activeSelectedDay.record.checkIn?.time || activeSelectedDay.record.checkOut?.time)) ||
            (activeSelectedDay.isCurrentDay && activeSelectedDay.hasWorked && (attendanceData?.currentSession?.checkIn?.time || lastActionTime))) && (
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-700">
              {(activeSelectedDay.record?.checkIn?.time || (activeSelectedDay.isCurrentDay && attendanceData?.currentSession?.checkIn?.time)) && (
                <div className="flex items-center gap-1.5">
                  <LogIn className="w-3.5 h-3.5 text-[#16a34a]" />
                  <span>Check In:</span>
                  <span className="font-bold text-slate-900">
                    {format(
                      new Date(activeSelectedDay.record?.checkIn?.time || attendanceData!.currentSession!.checkIn.time),
                      "hh:mm a"
                    )}
                  </span>
                </div>
              )}
              {(activeSelectedDay.record?.checkOut?.time || (activeSelectedDay.isCurrentDay && todayStatus === "clock_out" && (attendanceData?.currentSession?.checkOut?.time || lastActionTime))) && (
                <div className="flex items-center gap-1.5">
                  <LogOut className="w-3.5 h-3.5 text-[#dc2626]" />
                  <span>Check Out:</span>
                  <span className="font-bold text-slate-900">
                    {format(
                      new Date(activeSelectedDay.record?.checkOut?.time || attendanceData?.currentSession?.checkOut?.time || lastActionTime!),
                      "hh:mm a"
                    )}
                  </span>
                </div>
              )}
              {(activeSelectedDay.record?.totalBreakDurationString || (activeSelectedDay.isCurrentDay && attendanceData?.totalBreakDurationString)) && (
                <div className="flex items-center gap-1.5">
                  <Coffee className="w-3.5 h-3.5 text-[#d97706]" />
                  <span>Breaks:</span>
                  <span className="font-bold text-slate-900">
                    {activeSelectedDay.record?.totalBreakDurationString || attendanceData?.totalBreakDurationString}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MonthlyAttendanceCalendar;
