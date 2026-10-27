import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  sidebarOpen: boolean;
  loadingCount: number;
  sessionReplacedOpen: boolean;
  selectedTimezone: string;
  timezoneView: "local" | "office" | "dual" | "admin" | "employee";
}

const initialState: UIState = {
  sidebarOpen: true,
  loadingCount: 0,
  sessionReplacedOpen: false,
  selectedTimezone: "UTC",
  timezoneView: "local",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    startLoading: (state) => {
      state.loadingCount += 1;
    },
    stopLoading: (state) => {
      state.loadingCount = Math.max(0, state.loadingCount - 1);
    },
    setSessionReplacedOpen: (state, action: PayloadAction<boolean>) => {
      state.sessionReplacedOpen = action.payload;
    },
    setSelectedTimezone: (state, action: PayloadAction<string>) => {
      state.selectedTimezone = action.payload;
    },
    setTimezoneView: (state, action: PayloadAction<"local" | "office" | "dual" | "admin" | "employee">) => {
      state.timezoneView = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  startLoading,
  stopLoading,
  setSessionReplacedOpen,
  setSelectedTimezone,
  setTimezoneView,
} = uiSlice.actions;

export const selectIsLoading = (state: { ui: { loadingCount: number } }) => state.ui.loadingCount > 0;
export default uiSlice.reducer;
