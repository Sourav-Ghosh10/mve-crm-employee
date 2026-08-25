import React, { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import RequireAuth from "./components/common/RequireAuth";
import LoadingSpinner from "./components/common/LoadingSpinner";
import { AttendanceProvider } from "./contexts/AttendanceContext";


const Dashboard = lazy(() => import("./pages/Dashboard"));
const Users = lazy(() => import("./pages/Users"));
const UserProfile = lazy(() => import("./pages/Users/UserProfile"));
const Attendance = lazy(() => import("./pages/Attendance"));
const Leave = lazy(() => import("./pages/Leave"));
const Schedule = lazy(() => import("./pages/Schedule"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const Reimbursement = lazy(() => import("./pages/Reimbursement"));
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Announcements = lazy(() => import("./pages/Announcements"));

const Loading = () => <LoadingSpinner fullScreen />;

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <RequireAuth>
        <AttendanceProvider>
          <MainLayout />
        </AttendanceProvider>
      </RequireAuth>

    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: "announcements",
        element: (
          <Suspense fallback={<Loading />}>
            <Announcements />
          </Suspense>
        ),
      },
      {
        path: "users",
        element: (
          <Suspense fallback={<Loading />}>
            <Users />
          </Suspense>
        ),
      },
      {
        path: "attendance",
        element: (
          <Suspense fallback={<Loading />}>
            <Attendance />
          </Suspense>
        ),
      },
      {
        path: "leave",
        element: (
          <Suspense fallback={<Loading />}>
            <Leave />
          </Suspense>
        ),
      },
      {
        path: "schedule",
        element: (
          <Suspense fallback={<Loading />}>
            <Schedule />
          </Suspense>
        ),
      },
      {
        path: "users/:id",
        element: (
          <Suspense fallback={<Loading />}>
            <UserProfile />
          </Suspense>
        ),
      },
      {
        path: "profile",
        element: (
          <Suspense fallback={<Loading />}>
            <Profile />
          </Suspense>
        ),
      },
      {
        path: "settings",
        element: (
          <Suspense fallback={<Loading />}>
            <Settings />
          </Suspense>
        ),
      },
      {
        path: "reimbursements",
        element: (
          <Suspense fallback={<Loading />}>
            <Reimbursement />
          </Suspense>
        ),
      },
      {
        path: "*",
        element: (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Page Under Construction
            </h2>
            <p className="text-foreground-secondary">
              This page is coming soon.
            </p>
          </div>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: (
      <Suspense fallback={<Loading />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <Suspense fallback={<Loading />}>
        <ForgotPassword />
      </Suspense>
    ),
  },
],
  {
    basename: import.meta.env.VITE_PUBLIC_URL || "/",
  });

const AppRoutes: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRoutes;
