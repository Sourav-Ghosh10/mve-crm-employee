import { render, screen } from "@testing-library/react";
import { Navigate, useLocation } from "react-router-dom";
import RequireAuth from "./RequireAuth";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { fetchCurrentUser } from "../../store/slices/authSlice";

// Mock the dependencies
jest.mock("react-router-dom", () => ({
    Navigate: jest.fn(() => null),
    useLocation: jest.fn(),
}));

jest.mock("../../store/hooks", () => ({
    useAppSelector: jest.fn(),
    useAppDispatch: jest.fn(),
}));

jest.mock("../../store/slices/authSlice", () => ({
    fetchCurrentUser: jest.fn(),
}));

jest.mock("./LoadingSpinner", () => ({
    __esModule: true,
    default: () => <div data-testid="loading-spinner">Loading...</div>,
}));

describe("RequireAuth Component", () => {
    const mockDispatch = jest.fn();
    const mockLocation = { pathname: "/dashboard" };

    beforeEach(() => {
        jest.clearAllMocks();
        (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
        (useLocation as jest.Mock).mockReturnValue(mockLocation);
    });

    it("renders children if authenticated and user data is loaded", () => {
        (useAppSelector as jest.Mock).mockReturnValue({
            isAuthenticated: true,
            user: { id: "1", name: "John Doe" },
            isLoading: false,
        });

        render(
            <RequireAuth>
                <div data-testid="protected-content">Protected</div>
            </RequireAuth>
        );

        expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    });

    it("redirects to login if not authenticated", () => {
        (useAppSelector as jest.Mock).mockReturnValue({
            isAuthenticated: false,
            user: null,
            isLoading: false,
        });

        render(
            <RequireAuth>
                <div>Protected</div>
            </RequireAuth>
        );

        expect(Navigate).toHaveBeenCalledWith(
            expect.objectContaining({
                to: "/login",
                state: { from: mockLocation },
                replace: true,
            }),
            undefined
        );
    });

    it("shows loading spinner if authenticated but user is null and loading", () => {
        (useAppSelector as jest.Mock).mockReturnValue({
            isAuthenticated: true,
            user: null,
            isLoading: true,
        });

        render(
            <RequireAuth>
                <div>Protected</div>
            </RequireAuth>
        );

        expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });

    it("dispatches fetchCurrentUser if authenticated but user is null and not loading", () => {
        (useAppSelector as jest.Mock).mockReturnValue({
            isAuthenticated: true,
            user: null,
            isLoading: false,
        });

        render(
            <RequireAuth>
                <div>Protected</div>
            </RequireAuth>
        );

        expect(mockDispatch).toHaveBeenCalledWith(fetchCurrentUser());
    });
});
