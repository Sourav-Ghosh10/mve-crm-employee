import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface NotificationState {
  unreadCount: number;
  newNotificationCount: number;
  message: string | null;
  type: "info" | "success" | "warning" | "error";
  refreshTrigger: number;
}

const initialState: NotificationState = {
  unreadCount: 0,
  newNotificationCount: 0,
  message: null,
  type: "info",
  refreshTrigger: 0,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    incrementNewCount: (state) => {
      state.newNotificationCount += 1;
    },
    resetNewCount: (state) => {
      state.newNotificationCount = 0;
    },
    resetAllCounts: (state) => {
      state.unreadCount = 0;
      state.newNotificationCount = 0;
    },
    showNotification: (state, action: PayloadAction<{ message: string; type?: NotificationState["type"] }>) => {
      state.message = action.payload.message;
      state.type = action.payload.type || "info";
    },
    clearNotification: (state) => {
      state.message = null;
    },
    triggerRefresh: (state) => {
      state.refreshTrigger += 1;
    },
  },
});

export const {
  incrementUnreadCount,
  setUnreadCount,
  incrementNewCount,
  resetNewCount,
  resetAllCounts,
  showNotification,
  clearNotification,
  triggerRefresh
} = notificationSlice.actions;

export default notificationSlice.reducer;
