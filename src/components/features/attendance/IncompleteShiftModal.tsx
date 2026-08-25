import React, { useState } from "react";
import Modal from "../../common/Modal/Modal";
import Button from "../../common/Button/Button";
import Input from "../../common/Input/Input";
import { AlertCircle } from "lucide-react";
import type { IncompleteShift } from "../../../types/attendance";
import { formatDate, formatTime } from "../../../utils/formatters";

interface IncompleteShiftModalProps {
    shift: IncompleteShift;
    onSave: (data: { shiftId: string; logoutTime: string; reason: string; shiftDate: string; remarks?: string }) => Promise<boolean>;

    loading: boolean;
}

const REASONS = [
    "Forgot to logout",
    "Network issue",
    "System/browser issue",
    "Power outage",
    "Extended work / Emergency",
    "Other",
];

const IncompleteShiftModal: React.FC<IncompleteShiftModalProps> = ({ shift, onSave, loading }) => {
    const checkInTime = shift.checkIn?.time || shift.loginTime;
    const checkInDate = checkInTime ? new Date(checkInTime) : new Date();
    const [logoutDate, setLogoutDate] = useState(shift.shiftDate || checkInDate.toISOString().split("T")[0]);
    const [logoutTime, setLogoutTime] = useState("");
    const [reason, setReason] = useState("");
    const [remarks, setRemarks] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!logoutDate || !logoutTime || !reason) {
            setError("All fields are mandatory.");
            return;
        }

        const logoutDateTime = new Date(`${logoutDate}T${logoutTime}`);
        const checkInDateTime = checkInTime ? new Date(checkInTime) : new Date();

        if (logoutDateTime <= checkInDateTime) {
            setError("Logout time must be after login time.");
            return;
        }

        const success = await onSave({
            shiftId: shift.shiftId || shift._id,
            logoutTime: logoutDateTime.toISOString(),
            reason,
            shiftDate: shift.shiftDate || logoutDate,
            remarks: reason === "Other" ? remarks : undefined,
        });


        if (!success) {
            setError("Failed to save logout details. Please try again.");
        }
    };


    return (
        <Modal
            open={true}
            onClose={() => { }} // Non-dismissible
            isDismissible={false}
            title="Incomplete Shift Detected"
            maxWidth="sm"
        >

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-warning/10 border border-warning/20 p-4 rounded-xl flex gap-3 text-warning-dark">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-semibold">Action Required</p>
                        <p className="opacity-80">
                            You did not log out from your previous shift on{" "}
                            <span className="font-bold">{formatDate(checkInDate)}</span> at{" "}
                            <span className="font-bold">{formatTime(checkInDate)}</span>. Please provide the logout details to continue.
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Logout Date"
                            type="date"
                            value={logoutDate}
                            onChange={(e) => setLogoutDate(e.target.value)}
                            required
                            disabled={loading}
                        // icon={<Calendar className="w-4 h-4" />}
                        />
                        <Input
                            label="Logout Time"
                            type="time"
                            value={logoutTime}
                            onChange={(e) => setLogoutTime(e.target.value)}
                            required
                            disabled={loading}
                        // icon={<Clock className="w-4 h-4" />}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground-secondary">
                            Reason for Late Logout
                        </label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                            disabled={loading}
                            className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
                        >
                            <option value="">Select a reason</option>
                            {REASONS.map((r) => (
                                <option key={r} value={r}>
                                    {r}
                                </option>
                            ))}
                        </select>
                    </div>

                    {reason === "Other" && (
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground-secondary">
                                Remarks
                            </label>
                            <textarea
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                required
                                disabled={loading}
                                className="w-full p-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm min-h-[100px] resize-none"
                                placeholder="Please specify the reason..."
                            />
                        </div>
                    )}
                </div>

                {error && (
                    <div className="p-3 rounded-lg bg-error/10 text-error text-sm font-medium animate-shake">
                        {error}
                    </div>
                )}

                <Button
                    type="submit"
                    className="w-full py-6 text-lg font-bold shadow-lg shadow-primary/20"
                    disabled={loading}
                // loading={loading}
                >
                    Save & Continue
                </Button>
            </form>
        </Modal>
    );
};

export default IncompleteShiftModal;
