import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../../store/slices/authSlice";
import Leave from "./Leave";
import { leaveService } from "../../services/leaveService";
import { jest } from "@jest/globals";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { User } from "../../types/user.types";
import type { AuthState } from "../../store/slices/authSlice";

const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    });

jest.mock("../../services/leaveService");

const createMockStore = (initialState = {}) => {
    return configureStore({
        reducer: {
            auth: authReducer
        },
        preloadedState: {
            auth: {
                user: { _id: "admin1", isAdmin: true, permissions: { canApproveLeave: true } } as unknown as User,
                isAuthenticated: true,
                isLoading: false,
                isInitialized: true,
                error: null,
                ...initialState
            } as unknown as AuthState
        }
    });
};

describe("Leave Page", () => {
    beforeEach(() => {
        jest.mocked(leaveService.getMyStats).mockResolvedValue({
            status: "success",
            data: {
                available: 15,
                used: 5,
                pending: 2,
                total: 20,
                approvedLeaveDays: 5,
                approvedLeaveHours: 40,
            }
        } as any);
        jest.mocked(leaveService.getMyBalance).mockResolvedValue({
            success: true,
            data: {
                balances: []
            }
        } as any);
        jest.mocked(leaveService.getMyRequests).mockResolvedValue({
            success: true,
            data: []
        } as any);
        jest.mocked(leaveService.getLeaveTypes).mockResolvedValue({
            status: "success",
            data: []
        } as any);
    });

    it("renders leave page and stats", async () => {
        const store = createMockStore();
        render(
            <QueryClientProvider client={createTestQueryClient()}>
                <Provider store={store}>
                    <MemoryRouter>
                        <Leave />
                    </MemoryRouter>
                </Provider>
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.getByText("Leave Requests")).toBeInTheDocument();
            expect(screen.getByText("Plan Your Break")).toBeInTheDocument();
            expect(screen.getByText("Available Balance")).toBeInTheDocument();
        });
    });

    it("shows empty state when no requests", async () => {
        const store = createMockStore();
        render(
            <QueryClientProvider client={createTestQueryClient()}>
                <Provider store={store}>
                    <MemoryRouter>
                        <Leave />
                    </MemoryRouter>
                </Provider>
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.getByText("No leave requests found")).toBeInTheDocument();
        });
    });
});

