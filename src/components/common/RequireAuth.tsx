import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { fetchCurrentUser } from "../../store/slices/authSlice";
import LoadingSpinner from "./LoadingSpinner";

type Props = {
  children: React.ReactElement;
};

const RequireAuth: React.FC<Props> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, isLoading } = useAppSelector((s) => s.auth);
  const location = useLocation();

  // Fetch current user on mount if authenticated but user is null
  useEffect(() => {
    if (isAuthenticated && !user && !isLoading) {
      dispatch(fetchCurrentUser());
    }
  }, [isAuthenticated, user, isLoading, dispatch]);

  // Show loading spinner while fetching user data
  if (isAuthenticated && !user && isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  // If authenticated and user data is loaded (or loading complete), render children
  if (isAuthenticated) {
    return children;
  }

  // Not authenticated — redirect to login, preserve attempted location
  return (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default RequireAuth;
