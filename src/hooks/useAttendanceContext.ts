import { useContext } from "react";
import { AttendanceContext } from "../contexts/AttendanceContextInstance";

export const useAttendanceContext = () => {
    const context = useContext(AttendanceContext);
    if (context === undefined) {
        throw new Error("useAttendanceContext must be used within an AttendanceProvider");
    }
    return context;
};
