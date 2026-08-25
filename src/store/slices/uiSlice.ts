import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    sidebarOpen: true,
    loadingCount: 0,
  },
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
  },
});

export const { toggleSidebar, startLoading, stopLoading } = uiSlice.actions;
export const selectIsLoading = (state: { ui: { loadingCount: number } }) => state.ui.loadingCount > 0;
export default uiSlice.reducer;
