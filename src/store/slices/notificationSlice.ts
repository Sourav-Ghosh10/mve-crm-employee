import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";

export interface NotificationItem {
  id: string;
  _id?: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type?: string;
  [key: string]: any;
}

export interface NotificationState {
  unreadCount: number;
  newNotificationCount: number;
  message: string | null;
  type: "info" | "success" | "warning" | "error";
  refreshTrigger: number;
  notifications: NotificationItem[];
  loading?: boolean;
}

export const fetchNotifications = createAsyncThunk(
  "notification/fetchNotifications",
  async () => {
    return [] as NotificationItem[];
  }
);

export const markNotificationRead = createAsyncThunk(
  "notification/markNotificationRead",
  async (id: string) => {
    return id;
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  "notification/markAllNotificationsRead",
  async () => {
    return true;
  }
);

const initialState: NotificationState = {
  unreadCount: 0,
  newNotificationCount: 0,
  message: null,
  type: "info",
  refreshTrigger: 0,
  notifications: [],
  loading: false,
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const notif = state.notifications.find((n) => (n.id === action.payload || n._id === action.payload));
        if (notif) notif.isRead = true;
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.notifications.forEach((n) => {
          n.isRead = true;
        });
        state.unreadCount = 0;
      });
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
