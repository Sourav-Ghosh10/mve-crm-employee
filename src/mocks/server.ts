import { createServer, Response } from "miragejs";
import type { Request } from "miragejs";

// Types for our data
interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "admin" | "hr" | "manager" | "employee";
  department: string;
  designation: string;
  status: "active" | "inactive" | "on_leave";
  joinDate: string;
  phoneNumber?: string;
  avatar?: string;
}

interface StoredToken {
  userId: string;
  refreshToken: string;
  expiresAt: number;
}

// Hardcoded credentials for demo
const DEMO_CREDENTIALS = {
  email: "admin@codecit.com",
  password: "Admin@123",
};

// In-memory storage for tokens
const tokenStore: StoredToken[] = [];

// Demo users database
const usersDb: User[] = [
  {
    id: "1",
    email: DEMO_CREDENTIALS.email,
    password: DEMO_CREDENTIALS.password,
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    department: "Management",
    designation: "System Administrator",
    status: "active",
    joinDate: "2023-01-01",
    phoneNumber: "+1 234 567 8900",
  },
  {
    id: "2",
    email: "john.doe@codecit.com",
    password: "John@123",
    firstName: "John",
    lastName: "Doe",
    role: "employee",
    department: "Engineering",
    designation: "Senior Developer",
    status: "active",
    joinDate: "2023-03-15",
    phoneNumber: "+1 234 567 8901",
  },
  {
    id: "3",
    email: "jane.smith@codecit.com",
    password: "Jane@123",
    firstName: "Jane",
    lastName: "Smith",
    role: "hr",
    department: "Human Resources",
    designation: "HR Manager",
    status: "active",
    joinDate: "2023-02-20",
    phoneNumber: "+1 234 567 8902",
  },
  {
    id: "4",
    email: "demo@example.com",
    password: "DemoUser123!",
    firstName: "Demo",
    lastName: "User",
    role: "manager",
    department: "Operations",
    designation: "Operations Manager",
    status: "active",
    joinDate: "2023-06-01",
    phoneNumber: "+1 555 123 4567",
  },
];

// JWT-like token generation (simplified for mock)
const generateToken = (userId: string, type: "access" | "refresh"): string => {
  const payload = {
    userId,
    type,
    exp:
      type === "access"
        ? Date.now() + 15 * 60 * 1000 // 15 minutes
        : Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    iat: Date.now(),
  };
  return btoa(JSON.stringify(payload));
};

const decodeToken = (
  token: string,
): { userId: string; type: string; exp: number } | null => {
  try {
    // Check if token is a real JWT (header.payload.signature)
    if (token.includes('.')) {
      const parts = token.split('.');
      if (parts.length === 3) {
        return JSON.parse(atob(parts[1]));
      }
    }
    // Fallback for simple mock tokens
    return JSON.parse(atob(token));
  } catch {
    return null;
  }
};

const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  // Handle both second-based (standard JWT) and millisecond-based (mock) expiration
  const exp = decoded.exp;
  const now = Date.now();
  // If exp is small (e.g. 1765888329), it's seconds. If large (1765888329000), it's ms.
  const expMs = exp < 10000000000 ? exp * 1000 : exp;
  return expMs < now;
};

// Helper to get user without password
const sanitizeUser = (user: User): Omit<User, "password"> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...userData } = user;
  return userData;
};

export function makeServer({ environment = "development" } = {}) {
  return createServer({
    environment,

    routes() {
      // Make Mirage intercept requests to the same API base URL the app uses.
      // If `VITE_API_URL` includes `/api` (e.g. "http://localhost:5000/api"),
      // strip the trailing `/api` because we set `this.namespace = 'api'` below.
      const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const urlPrefix = rawApiUrl.replace(/\/api\/?$/i, "").replace(/\/$/, "");
      this.urlPrefix = urlPrefix;
      this.namespace = "api";
      this.timing = 500; // Simulate network delay

      // Login endpoint
      this.post("/auth/login", (_schema, request) => {
        const { email, password } = JSON.parse(request.requestBody);

        const user = usersDb.find(
          (u) => u.email === email && u.password === password,
        );

        if (!user) {
          return new Response(
            401,
            {},
            {
              success: false,
              error: {
                code: "INVALID_CREDENTIALS",
                message: "Invalid email or password",
              },
            },
          );
        }

        const accessToken = generateToken(user.id, "access");
        const refreshToken = generateToken(user.id, "refresh");

        // Store refresh token
        tokenStore.push({
          userId: user.id,
          refreshToken,
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        });

        // Return backend-compatible response structure
        return {
          success: true,
          message: "Login successful",
          data: {
            user: {
              _id: user.id,
              personalInfo: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phoneNumber || "",
              },
              employment: {
                role: user.role,
                department: user.department,
                designation: user.designation,
                dateOfJoining: user.joinDate,
              },
              isActive: user.status === "active",
            },
            accessToken,
            refreshToken,
            sessionId: `session_${user.id}_${Date.now()}`,
          },
        };
      });

      // Refresh token endpoint
      this.post("/auth/refresh-token", (_schema, request) => {
        const { refreshToken } = JSON.parse(request.requestBody);

        if (!refreshToken) {
          return new Response(
            401,
            {},
            {
              success: false,
              error: {
                code: "NO_REFRESH_TOKEN",
                message: "No refresh token provided",
              },
            },
          );
        }

        if (isTokenExpired(refreshToken)) {
          return new Response(
            401,
            {},
            {
              success: false,
              error: {
                code: "TOKEN_EXPIRED",
                message: "Refresh token has expired",
              },
            },
          );
        }

        const decoded = decodeToken(refreshToken);
        if (!decoded) {
          return new Response(
            401,
            {},
            {
              success: false,
              error: {
                code: "INVALID_TOKEN",
                message: "Invalid refresh token",
              },
            },
          );
        }

        const storedToken = tokenStore.find(
          (t) => t.refreshToken === refreshToken && t.userId === decoded.userId,
        );

        if (!storedToken) {
          return new Response(
            401,
            {},
            {
              success: false,
              error: {
                code: "TOKEN_NOT_FOUND",
                message: "Refresh token not found",
              },
            },
          );
        }

        const newAccessToken = generateToken(decoded.userId, "access");
        const newRefreshToken = generateToken(decoded.userId, "refresh");

        // Update stored token
        const index = tokenStore.indexOf(storedToken);
        tokenStore[index] = {
          userId: decoded.userId,
          refreshToken: newRefreshToken,
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        };

        return {
          success: true,
          data: {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          },
        };
      });

      // Logout endpoint
      this.post("/auth/logout", (_schema, request) => {
        const authHeader = request.requestHeaders.Authorization;
        if (authHeader) {
          const token = authHeader.replace("Bearer ", "");
          const decoded = decodeToken(token);
          if (decoded) {
            // Remove all tokens for this user
            const index = tokenStore.findIndex((t) => t.userId === decoded.userId);
            if (index !== -1) {
              tokenStore.splice(index, 1);
            }
          }
        }

        return {
          success: true,
          message: "Logged out successfully",
        };
      });

      // Get current user endpoint
      this.get("/auth/me", (_schema, request) => {
        const authHeader = request.requestHeaders.Authorization;
        if (!authHeader) {
          return new Response(
            401,
            {},
            {
              success: false,
              error: {
                code: "UNAUTHORIZED",
                message: "No authorization token provided",
              },
            },
          );
        }

        const token = authHeader.replace("Bearer ", "");
        if (isTokenExpired(token)) {
          return new Response(
            401,
            {},
            {
              success: false,
              error: {
                code: "TOKEN_EXPIRED",
                message: "Access token has expired",
              },
            },
          );
        }

        const decoded = decodeToken(token);
        if (!decoded) {
          return new Response(
            401,
            {},
            {
              success: false,
              error: {
                code: "INVALID_TOKEN",
                message: "Invalid token format",
              },
            },
          );
        }

        // Search for user by ID. 
        // Note: Real backend uses 24-char hex IDs. Mock DB needs to support this.
        const user = usersDb.find((u) => u.id === decoded.userId);

        // If not found in mock DB, return the demo user as fallback 
        // effectively treating the logged-in real user as the demo user for mock data purposes
        const foundUser = user || usersDb.find(u => u.email === "demo@example.com");

        if (!foundUser) {
          return new Response(
            404,
            {},
            {
              success: false,
              error: {
                code: "USER_NOT_FOUND",
                message: "User not found",
              },
            },
          );
        }

        return {
          success: true,
          data: {
            user: sanitizeUser(foundUser),
          },
        };
      });

      // Get all users (for admin)
      this.get("/users", () => {
        const usersData = usersDb.map(sanitizeUser);

        return {
          success: true,
          data: {
            users: usersData,
            total: usersData.length,
          },
        };
      });

      // Get user by ID
      this.get("/users/:id", (_schema, request) => {
        const user = usersDb.find((u) => u.id === request.params.id);
        if (!user) {
          return new Response(
            404,
            {},
            {
              success: false,
              error: {
                code: "USER_NOT_FOUND",
                message: "User not found",
              },
            },
          );
        }

        return {
          success: true,
          data: {
            user: sanitizeUser(user),
          },
        };
      });

      // Simple in-memory attendance storage: keyed by userId
      // Enhanced attendance storage
      interface BreakSession {
        startTime: string;
        endTime?: string;
        duration?: number;
      }

      interface WorkSession {
        status: "present" | "on_break" | "clocked_out" | "not_clocked";
        checkInTime: number | null;
        checkOutTime: number | null;
        breaks: BreakSession[];
        totalBreakTimeMinutes: number;
      }

      const sessionsDb: Record<string, WorkSession> = {};

      // Initialize with historical data for demo
      const getOrCreateSession = (userId: string): WorkSession => {
        if (!sessionsDb[userId]) {
          // Pre-seed with user provided data structure if it's the first time
          sessionsDb[userId] = {
            status: "present", // Assume present based on data
            checkInTime: new Date("2026-01-01T07:46:24.292Z").getTime(),
            checkOutTime: null,
            totalBreakTimeMinutes: 19.507,
            breaks: [
              { startTime: "2026-01-01T09:16:36.958Z", endTime: "2026-01-01T09:16:47.157Z" },
              { startTime: "2026-01-01T10:00:34.149Z", endTime: "2026-01-01T10:00:46.090Z" },
              { startTime: "2026-01-01T10:01:48.145Z", endTime: "2026-01-01T10:01:49.640Z" },
              { startTime: "2026-01-01T10:03:00.272Z", endTime: "2026-01-01T10:03:02.270Z" },
              { startTime: "2026-01-01T10:03:17.064Z", endTime: "2026-01-01T10:04:15.760Z" },
              { startTime: "2026-01-01T10:04:23.415Z", endTime: "2026-01-01T10:04:26.545Z" },
              { startTime: "2026-01-01T10:04:28.250Z", endTime: "2026-01-01T10:04:32.015Z" },
              { startTime: "2026-01-01T10:04:33.569Z", endTime: "2026-01-01T10:04:35.793Z" },
              { startTime: "2026-01-01T10:04:36.978Z", endTime: "2026-01-01T10:05:16.330Z" },
              { startTime: "2026-01-01T10:05:20.914Z", endTime: "2026-01-01T10:05:23.858Z" },
              { startTime: "2026-01-01T10:05:24.914Z", endTime: "2026-01-01T10:05:26.483Z" },
              { startTime: "2026-01-01T10:06:04.496Z", endTime: "2026-01-01T10:06:05.752Z" },
              { startTime: "2026-01-01T10:31:48.132Z", endTime: "2026-01-01T10:31:50.474Z" },
              { startTime: "2026-01-01T10:31:52.495Z", endTime: "2026-01-01T10:31:53.887Z" },
              { startTime: "2026-01-01T10:33:00.369Z", endTime: "2026-01-01T10:33:02.923Z" },
              { startTime: "2026-01-01T10:34:39.960Z", endTime: "2026-01-01T10:34:42.086Z" },
              { startTime: "2026-01-01T10:35:43.267Z", endTime: "2026-01-01T10:45:19.943Z" },
              { startTime: "2026-01-01T10:45:35.134Z", endTime: "2026-01-01T10:48:42.983Z" },
              { startTime: "2026-01-01T11:05:51.790Z", endTime: "2026-01-01T11:07:10.691Z" },
              { startTime: "2026-01-01T11:10:40.248Z", endTime: "2026-01-01T11:11:43.995Z" },
              { startTime: "2026-01-01T11:17:57.514Z", endTime: "2026-01-01T11:18:05.635Z" },
              { startTime: "2026-01-01T11:19:51.642Z", endTime: "2026-01-01T11:20:12.488Z" },
              { startTime: "2026-01-01T11:21:05.586Z", endTime: "2026-01-01T11:22:32.883Z" }
            ]
          };
        }
        return sessionsDb[userId];
      };

      // Helper to get userId from Authorization header
      const getUserIdFromAuth = (request: Request): string | null => {
        const authHeader = request.requestHeaders.Authorization;
        if (!authHeader) return null;
        const token = authHeader.replace("Bearer ", "");
        const decoded = decodeToken(token);
        return decoded?.userId || null;
      };

      // Clock in
      this.post("/attendance/clockin", (_schema, request) => {
        const userId = getUserIdFromAuth(request);
        // Map real user ID to mock user ID if needed, or just use it as key

        if (!userId) {
          return new Response(
            401,
            {},
            { success: false, error: { code: "UNAUTHORIZED", message: "No token" } },
          );
        }

        const session = getOrCreateSession(userId);
        const now = Date.now();

        session.status = "present";
        session.checkInTime = now;
        // Reset breaks for new day/session? Or keep accumulating? 
        // For simple mock, let's just update prompt-check-in.

        return {
          success: true,
          data: {
            action: "clock_in",
            timestamp: now,
            checkIn: { time: new Date(now).toISOString() },
            status: "present",
            breakTime: session.totalBreakTimeMinutes,
            breaks: session.breaks
          },
        };
      });

      // Clock out
      this.post("/attendance/clockout", (_schema, request) => {
        const userId = getUserIdFromAuth(request);
        if (!userId) {
          return new Response(
            401,
            {},
            { success: false, error: { code: "UNAUTHORIZED", message: "No token" } },
          );
        }

        const session = getOrCreateSession(userId);
        const now = Date.now();

        session.status = "clocked_out";
        session.checkOutTime = now;

        return {
          success: true,
          data: {
            action: "clock_out",
            timestamp: now,
            checkOut: { time: new Date(now).toISOString() },
            status: "clocked_out",
            breakTime: session.totalBreakTimeMinutes,
            breaks: session.breaks
          },
        };
      });

      // Get today's attendance status for current user
      this.get("/attendance/me", (_schema, request) => {
        const userId = getUserIdFromAuth(request);
        if (!userId) {
          return new Response(
            401,
            {},
            { success: false, error: { code: "UNAUTHORIZED", message: "No token" } },
          );
        }

        const session = getOrCreateSession(userId);

        // Calculate live break time if on break
        let currentBreakDuration = 0;
        let currentBreakObj = null;

        if (session.status === "on_break") {
          const lastBreak = session.breaks[session.breaks.length - 1];
          if (lastBreak && lastBreak.startTime && !lastBreak.endTime) {
            const start = new Date(lastBreak.startTime).getTime();
            currentBreakDuration = (Date.now() - start) / (1000 * 60);
            currentBreakObj = {
              startTime: lastBreak.startTime,
            };
          }
        }

        return {
          success: true,
          data: {
            lastAction: session.status === "present" ? "clock_in" : (session.status === "on_break" ? "break_start" : "clock_out"),
            timestamp: session.checkInTime, // Key check-in timestamp
            checkIn: { time: session.checkInTime ? new Date(session.checkInTime).toISOString() : null },
            status: session.status,
            isClockedIn: session.status !== "clocked_out" && session.status !== "not_clocked",
            isOnBreak: session.status === "on_break",
            currentBreak: currentBreakObj,
            breakTime: session.totalBreakTimeMinutes + currentBreakDuration,
            totalBreakTime: (session.totalBreakTimeMinutes + currentBreakDuration), // Keeping in minutes to match recent changes
            breaks: session.status === "on_break" ? session.breaks.slice(0, -1) : session.breaks, // Ongoing break usually not in list
            currentSession: {
              checkIn: { time: session.checkInTime ? new Date(session.checkInTime).toISOString() : null },
              breaks: session.status === "on_break" ? session.breaks.slice(0, -1) : session.breaks
            }
          },
        };
      });

      this.post("/attendance/break-start", (_schema, request) => {
        const userId = getUserIdFromAuth(request);
        if (!userId) return new Response(401, {}, { success: false });

        const session = getOrCreateSession(userId);
        const now = new Date();

        session.status = "on_break";
        session.breaks.push({ startTime: now.toISOString() });

        return {
          success: true,
          data: {
            status: "on_break",
            timestamp: now.toISOString(),
            breaks: session.breaks,
            breakTime: session.totalBreakTimeMinutes,
            checkIn: { time: session.checkInTime ? new Date(session.checkInTime).toISOString() : null }
          }
        };
      });

      this.post("/attendance/break-resume", (_schema, request) => {
        const userId = getUserIdFromAuth(request);
        if (!userId) return new Response(401, {}, { success: false });

        const session = getOrCreateSession(userId);
        const now = new Date();

        session.status = "present";

        // Find open break
        const openBreak = session.breaks.find(b => !b.endTime);
        if (openBreak) {
          openBreak.endTime = now.toISOString();
          // Add to total minutes
          const start = new Date(openBreak.startTime).getTime();
          const duration = (now.getTime() - start) / (1000 * 60);
          session.totalBreakTimeMinutes += duration;
        }

        return {
          success: true,
          data: {
            status: "present",
            timestamp: now.toISOString(),
            breaks: session.breaks,
            breakTime: session.totalBreakTimeMinutes,
            checkIn: { time: session.checkInTime ? new Date(session.checkInTime).toISOString() : null }
          }
        };
      });

      // Passthrough any other requests
      this.passthrough();
    },
  });
}
