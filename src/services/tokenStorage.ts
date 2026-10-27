import { getItem, setItem, removeItem, getSessionItem, setSessionItem, removeSessionItem } from "../utils/storage";

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
