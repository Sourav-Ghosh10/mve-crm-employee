import api, { tokenStorage } from "./api";
import type { User, BackendUser } from "../types/user.types";
import { mapUserResponse } from "../types/user.types";
import pushNotificationService from "./pushNotificationService";

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: BackendUser;
    accessToken: string;
    refreshToken: string;
    sessionId: string;
    requiresLogoutCorrection?: boolean;
    shiftId?: string;
    loginTime?: string;
    shiftDate?: string;
  };
}

// Frontend expects a specific AuthResponse format where data.user is the mapped User
export interface FormattedAuthResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<FormattedAuthResponse> => {
    console.log("AuthService: login started with", credentials.email);
    try {
      const response = await api.post<AuthResponse>("/auth/login", credentials);
      // console.log("AuthService: API response received", JSON.stringify(response.data, null, 2));

      if (response.data.success && response.data.data) {
        console.log("AuthService: Login success, storing tokens...");
        // Store tokens and session ID
        tokenStorage.setTokens(
          response.data.data.accessToken,
          response.data.data.refreshToken,
          // response.data.data.sessionId,
          // credentials.rememberMe
        );
        console.log("AuthService: Tokens stored.");

        console.log("AuthService: Mapping user:", response.data.data.user);
        const mappedUser = mapUserResponse(response.data.data.user);
        console.log("AuthService: Mapped user:", mappedUser);

        // Return mapped response expected by the slice
        return {
          success: true,
          data: {
            user: mappedUser,
            accessToken: response.data.data.accessToken,
            refreshToken: response.data.data.refreshToken,
          },
        };
      }

      console.error("AuthService: Login failed logically", response.data);
      throw new Error(response.data.message || "Login failed");
    } catch (err) {
      console.error("AuthService: Login threw error", err);
      throw err;
    }
  },

  loginWithGoogle: async ({
    email,
    token,
  }: {
    email: string;
    token: string;
  }): Promise<FormattedAuthResponse> => {
    console.log("AuthService: Google login started");
    try {
      // Send the access token and email to the backend
      // With Firebase, we get an ID token.
      const response = await api.post<AuthResponse>("/auth/google", {
        email,
        idToken: token,
      });
      // console.log("AuthService: API response received", JSON.stringify(response.data, null, 2));

      if (response.data.success && response.data.data) {
        console.log("AuthService: Google Login success, storing tokens...");
        tokenStorage.setTokens(
          response.data.data.accessToken,
          response.data.data.refreshToken,
          // response.data.data.sessionId
        );

        const mappedUser = mapUserResponse(response.data.data.user);

        return {
          success: true,
          data: {
            user: mappedUser,
            accessToken: response.data.data.accessToken,
            refreshToken: response.data.data.refreshToken,
          },
        };
      }

      console.error("AuthService: Google Login failed logically", response.data);
      throw new Error(response.data.message || "Google Login failed");
    } catch (err) {
      console.error("AuthService: Google Login threw error", err);
      throw err;
    }
  },

  logout: async (): Promise<void> => {
    try {
      // Unregister notification token from backend
      await pushNotificationService.unregisterToken();
      // Logout from backend
      await api.post("/auth/logout");
    } finally {
      // Always clear tokens, even if API call fails
      tokenStorage.clearTokens();
    }
  },

  getCurrentUser: async (): Promise<{
    success: boolean;
    data: { user: User };
  }> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await api.get<any>("/auth/me");

    // Logic to handle different response structures
    let backendUser: BackendUser;

    if (response.data.data && response.data.data.personalInfo) {
      // Case 1: structure is { success: true, data: { personalInfo... } } - The one provided by user
      backendUser = response.data.data;
    } else if (response.data.data && response.data.data.user && response.data.data.user.personalInfo) {
      // Case 2: structure is { success: true, data: { user: { personalInfo... } } } - Typical mock/old
      backendUser = response.data.data.user;
    } else {
      // Fallback or let it throw if structure is totally wrong, but let's try to pass mapped
      // Assuming it might already be mapped? Unlikely for this endpoint.
      return response.data;
    }

    return {
      success: true,
      data: {
        user: mapUserResponse(backendUser),
      },
    };
  },

  isAuthenticated: (): boolean => {
    return !!tokenStorage.getAccessToken();
  },

  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post("/auth/forgot-password", { email });
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to send OTP");
    }
    return response.data;
  },

  verifyOtp: async (email: string, otp: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post("/auth/verify-otp", { email, otp });
    if (!response.data.success) {
      throw new Error(response.data.message || "Invalid OTP");
    }
    return response.data;
  },

  resetPassword: async (
    email: string,
    otp: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.post("/auth/reset-password", {
      email,
      otp,
      newPassword,
    });
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to reset password");
    }
    return response.data;
  },
};
