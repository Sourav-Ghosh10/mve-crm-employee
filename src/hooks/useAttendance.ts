import { useAttendanceContext } from "../contexts/AttendanceContext";

export const useAttendance = () => {
    return useAttendanceContext();
};
