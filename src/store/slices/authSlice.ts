import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../types/user.types";
import { authService } from "../../services/authService";
import type { LoginCredentials } from "../../services/authService";
import { tokenStorage } from "../../services/api";

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: authService.isAuthenticated(),
  user: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      if (!response.success) {
        return rejectWithValue("Login failed");
      }
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      let message = "Invalid email or password";

      // Check if it's an axios error with a response
      if (error.response && error.response.data) {
        const data = error.response.data;
        if (typeof data === "string") {
          message = data;
        } else if (data.error?.message) {
          message = data.error.message;
        } else if (data.message) {
          message = data.message;
        } else if (data.error && typeof data.error === "string") {
          message = data.error;
        }
      } else if (error.message) {
        // Fallback to error message (e.g., "Request failed with status code 404")
        message = error.message;
      }

      return rejectWithValue(message);
    }
  },
);

export const loginWithGoogle = createAsyncThunk(
  "auth/loginWithGoogle",
  async (
    payload: { email: string; token: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await authService.loginWithGoogle(payload);
      if (!response.success) {
        return rejectWithValue("Google Login failed");
      }
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      let message = "Google Login failed";

      if (error.response && error.response.data) {
        const data = error.response.data;
        if (typeof data === "string") {
          message = data;
        } else if (data.error?.message) {
          message = data.error.message;
        } else if (data.message) {
          message = data.message;
        } else if (data.error && typeof data.error === "string") {
          message = data.error;
        }
      } else if (error.message) {
        message = error.message;
      }

      return rejectWithValue(message);
    }
  },
);

export const logout = createAsyncThunk("auth/logout", async () => {
  await authService.logout();
});

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser();

      // If we got here, we have a user from the mock server (or real API if that was used)
      // We need to ensure it matches the User type.
      // The authService.getCurrentUser is typed to return { data: { user: User } }
      // but let's be safe and map it if it looks like the backend user
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userData = response.data.user as any;
      
      if (userData.personalInfo) {
        // It's the backend structure, we need to map it
        // We can't easily import the mapper here without circular deps or code duplication
        // Ideally the service should have returned the mapped user.
        // Let's rely on the service to return the correct shape or handle it there.
        // Re-checking authService... it returns response.data directly.
        // Let's fix authService instead to map this too.
      }

      return response.data.user;
    } catch {
      // alert("Failed to fetch user");
      tokenStorage.clearTokens();
      return rejectWithValue("Failed to fetch user");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }>,
    ) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.error = null;
      tokenStorage.setTokens(
        action.payload.accessToken,
        action.payload.refreshToken,
      );
    },
    logoutSuccess: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
      tokenStorage.clearTokens();
    },
    clearError: (state) => {
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        console.log("authSlice - login.fulfilled, payload:", action.payload);
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
        console.log("authSlice - state updated, isAuthenticated:", state.isAuthenticated, "user:", state.user);
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload as string;
      })
      // Google Login
      .addCase(loginWithGoogle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
        tokenStorage.clearTokens();
      })
      .addCase(logout.rejected, (state) => {
        // Even if logout API fails, clear local state
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
        tokenStorage.clearTokens();
      })
      // Fetch current user
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const { loginSuccess, logoutSuccess, clearError, setError, updateUser } = authSlice.actions;
export default authSlice.reducer;
