import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig, AxiosRequestHeaders, AxiosRequestConfig } from "axios";
import { getItem, setItem, removeItem, getSessionItem, setSessionItem, removeSessionItem } from "../utils/storage";
import { store } from "../store/store";
import { startLoading, stopLoading } from "../store/slices/uiSlice";
import pushNotificationService from "./pushNotificationService";

export interface CustomAxiosConfig extends AxiosRequestConfig {
  skipLoading?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Token storage keys
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

// Token management utilities
export const tokenStorage = {
  getAccessToken: () => (getItem(ACCESS_TOKEN_KEY) || getSessionItem(ACCESS_TOKEN_KEY)) as string | null,
  getRefreshToken: () => (getItem(REFRESH_TOKEN_KEY) || getSessionItem(REFRESH_TOKEN_KEY)) as string | null,
  setTokens: (accessToken: string, refreshToken: string, rememberMe = true) => {
    // Clear potentially conflicting tokens first
    removeItem(ACCESS_TOKEN_KEY);
    removeItem(REFRESH_TOKEN_KEY);
    removeSessionItem(ACCESS_TOKEN_KEY);
    removeSessionItem(REFRESH_TOKEN_KEY);

    if (rememberMe) {
      setItem(ACCESS_TOKEN_KEY, accessToken);
      setItem(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      setSessionItem(ACCESS_TOKEN_KEY, accessToken);
      setSessionItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },
  clearTokens: () => {
    removeItem(ACCESS_TOKEN_KEY);
    removeItem(REFRESH_TOKEN_KEY);
    removeSessionItem(ACCESS_TOKEN_KEY);
    removeSessionItem(REFRESH_TOKEN_KEY);
  },
};

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Create a separate axios instance for token refresh requests to avoid
// triggering the interceptors on the main `api` instance.
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Show global loader unless explicitly disabled in config
    if ((config as CustomAxiosConfig).skipLoading !== true) {
      store.dispatch(startLoading());
    }

    const token = tokenStorage.getAccessToken();
    if (token) {
      if (!config.headers) {
        config.headers = {} as AxiosRequestHeaders;
      }
      (config.headers as AxiosRequestHeaders).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    store.dispatch(stopLoading());
    return Promise.reject(error);
  },
);

// Response interceptor - handle 401 errors
api.interceptors.response.use(
  (response) => {
    if ((response.config as CustomAxiosConfig).skipLoading !== true) {
      store.dispatch(stopLoading());
    }
    return response;
  },
  async (error: AxiosError) => {
    if ((error.config as CustomAxiosConfig)?.skipLoading !== true) {
      store.dispatch(stopLoading());
    }
    const originalRequest = (error.config || {}) as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Capture URL to check for recursion/special endpoints
    const url = originalRequest.url || "";
    const isUnregisterCall = url.includes("/notifications/unregister");
    const isLoginOrAuth = url.includes("/auth/login") ||
      url.includes("/auth/google") ||
      url.includes("/auth/verify-otp") ||
      url.includes("/auth/reset-password");

    // 1. If LOGIN fails with 401, just reject so UI shows "Invalid credentials"
    // Do NOT try to unregister or redirect to /login
    if (isLoginOrAuth) {
      return Promise.reject(error);
    }

    // Prevent infinite loop
    if (originalRequest._retry || isUnregisterCall) {
      // ONLY unregister if this isn't the unregister call itself failing
      if (!isUnregisterCall) {
        await pushNotificationService.unregisterToken();
      }
      tokenStorage.clearTokens();
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      // ONLY unregister if this isn't the unregister call itself failing
      if (!isUnregisterCall) {
        await pushNotificationService.unregisterToken();
      }
      tokenStorage.clearTokens();
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    // Queue to hold requests while refresh is in progress
    type PendingRequest = (token: string) => void;

    // Local typed accessor to avoid `any` casts and satisfy eslint
    type ApiWithRefresh = InternalAxiosRequestConfig & {
      _isRefreshing?: boolean;
      _refreshSubscribers?: PendingRequest[];
    };

    const apiTyped = api as unknown as ApiWithRefresh;

    if (!apiTyped._isRefreshing) {
      apiTyped._isRefreshing = true;
      apiTyped._refreshSubscribers = [] as PendingRequest[];

      try {
        const resp = await refreshClient.post("/auth/refresh-token", { refreshToken });
        const data = resp.data;
        if (data && data.success && data.data) {
          const newAccess = data.data.accessToken as string;
          const newRefresh = data.data.refreshToken as string;
          tokenStorage.setTokens(newAccess, newRefresh);

          apiTyped._isRefreshing = false;
          apiTyped._refreshSubscribers?.forEach((cb: PendingRequest) => cb(newAccess));
          apiTyped._refreshSubscribers = [];
        } else {
          throw new Error("Refresh failed");
        }
      } catch (refreshError) {
        apiTyped._isRefreshing = false;
        apiTyped._refreshSubscribers = [];
        tokenStorage.clearTokens();
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    // Return a promise that will retry the original request once a new token is available
    return new Promise((resolve) => {
      const subscribe = (token: string) => {
        if (!originalRequest.headers) originalRequest.headers = {} as AxiosRequestHeaders;
        (originalRequest.headers as AxiosRequestHeaders).Authorization = `Bearer ${token}`;
        originalRequest._retry = true;
        resolve(api(originalRequest));
      };

      apiTyped._refreshSubscribers?.push(subscribe);
    });
  },
);

export default api;
