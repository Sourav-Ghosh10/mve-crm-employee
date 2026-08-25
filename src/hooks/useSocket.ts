// hooks/useSocket.ts (repurposed for Push Notifications)
import { useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import pushNotificationService from "../services/pushNotificationService";
import {
  incrementNewCount,
  incrementUnreadCount,
  resetNewCount,
  triggerRefresh,
} from "../store/slices/notificationSlice";
import { toast } from "react-hot-toast";
import React from "react";
import logoStatic from "../assets/codecit-logo.png";
import { type MessagePayload } from "firebase/messaging";

export const useSocket = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { newNotificationCount } = useAppSelector(
    (state) => state.notification
  );

  const handleNewNotification = useCallback((payload: MessagePayload) => {
    console.log("🔔 Push notification received in foreground:", payload);

    // 1. Optimistically update counts
    dispatch(incrementNewCount());
    dispatch(incrementUnreadCount());

    // 2. Trigger background refresh (with slight delay to let backend sync if needed)
    setTimeout(() => {
      dispatch(triggerRefresh());
      // Invalidate all related query keys
      queryClient.invalidateQueries({ queryKey: ["recent-activities"] });
      queryClient.invalidateQueries({ queryKey: ["announcements-list"] });
      queryClient.invalidateQueries({ queryKey: ["announcements-marquee"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-dropdown"] });
    }, 1500);

    // 3. Extract data from payload for toast
    const data = payload?.data;
    const notification = payload?.notification;
    const title = notification?.title || data?.title || "New Announcement";
    const body = notification?.body || data?.body || data?.content || "You have a new update.";

    // 4. Show toast 
    toast(
      () => React.createElement('div', { className: "flex flex-col gap-1" },
        React.createElement('span', { className: "font-bold text-sm" }, title),
        React.createElement('span', { className: "text-xs opacity-80" }, body)
      ),
      {
        icon: React.createElement('img', {
          src: logoStatic,
          className: "w-6 h-6 rounded-md shadow-sm",
          alt: "logo"
        }),
        duration: 5000,
        position: 'top-right',
      }
    );
  }, [dispatch, queryClient]);

  const resetCount = useCallback(() => {
    dispatch(resetNewCount());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("Initializing Push Notification listeners...");
      // Register callback for when a push notification arrives in foreground
      pushNotificationService.setOnMessageCallback(handleNewNotification);

      // Start listening (returns unsubscribe)
      const unsubscribe = pushNotificationService.listenForMessages();

      // Ensure token is registered if permission is already granted
      if (Notification.permission === "granted") {
        pushNotificationService.requestPermissionAndRegister();
      }

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [isAuthenticated, user, handleNewNotification]);

  return {
    newNotificationCount,
    resetNotificationCount: resetCount,
  };
};
