import React, { useEffect, useRef } from "react";
import { useAppSelector } from "../../store/hooks";
import pushNotificationService from "../../services/pushNotificationService";

/**
 * 🔒 NON-BLOCKING COMPONENT
 * Handles initialization of Firebase Push Notifications
 */
const NotificationManager: React.FC = () => {
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);

    const initializedRef = useRef(false);

    useEffect(() => {
        if (isAuthenticated && user && !initializedRef.current) {
            initializedRef.current = true;
            // Request permission and register token only after login
            pushNotificationService.requestPermissionAndRegister();

            // Listen for foreground messages
            pushNotificationService.listenForMessages();
        }
    }, [isAuthenticated, user]);

    // This component doesn't render anything UI-visible
    return null;
};

export default NotificationManager;
