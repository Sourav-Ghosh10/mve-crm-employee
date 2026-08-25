import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import Modal from "../../common/Modal/Modal";
import Button from "../../common/Button/Button";
import pushNotificationService from "../../../services/pushNotificationService";

const NotificationPermissionModal: React.FC = () => {
    const [status, setStatus] = useState<NotificationPermission>(
        typeof window !== "undefined" && "Notification" in window
            ? Notification.permission
            : "default"
    );
    const [open, setOpen] = useState(
        typeof window !== "undefined" && "Notification" in window && Notification.permission !== "granted"
    );

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // This effect can stay empty or be removed if no other side effects are needed
    }, []);

    const handleEnable = async () => {
        if (!("Notification" in window)) {
            alert("Your browser does not support notifications");
            return;
        }

        try {
            setIsLoading(true);
            const permission = await Notification.requestPermission();
            setStatus(permission);

            if (permission === "granted") {
                await pushNotificationService.requestPermissionAndRegister();
                setOpen(false);
                return;
            }

            if (permission === "denied") {
                alert(
                    "Notifications are blocked.\n\n" +
                    "To enable:\n" +
                    "1. Click the 🔒 lock icon near the address bar\n" +
                    "2. Set Notifications to 'Allow'\n" +
                    "3. Refresh the page"
                );
            }
        } finally {
            setIsLoading(false);
        }
    };


    if (!open) return null;

    const isDenied = status === "denied";

    return (
        <Modal
            open={open}
            onClose={() => { }}
            title={isDenied ? "Notifications Blocked" : "Enable Notifications"}
            maxWidth="sm"
            isDismissible={false}
            actions={
                <Button
                    onClick={handleEnable}
                    variant="default"
                    className="w-full"
                    loading={isLoading}
                >
                    {isDenied ? "Enable Notifications" : "Enable Notifications"}
                </Button>
            }
        >
            <div className="flex flex-col items-center text-center space-y-4 py-2">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <Bell className="w-8 h-8" />
                </div>

                <div>
                    <p className="text-foreground font-medium mb-1">
                        {isDenied
                            ? "Notifications are blocked"
                            : "Stay updated in real time"}
                    </p>

                    <p className="text-sm text-foreground-secondary">
                        {isDenied
                            ? "You have blocked notifications for this site. Click the button above to re-enable them."
                            : "Enable push notifications to receive real-time announcements and important updates."
                        }
                    </p>
                </div>
            </div>
        </Modal>
    );
};

export default NotificationPermissionModal;
