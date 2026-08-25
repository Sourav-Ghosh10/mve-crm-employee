import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logout } from "../../store/slices/authSlice";

// Mock dependencies
jest.mock("react-router-dom", () => ({
    useNavigate: jest.fn(),
}));

jest.mock("../../store/hooks", () => ({
    useAppDispatch: jest.fn(),
    useAppSelector: jest.fn(),
}));

jest.mock("../../store/slices/authSlice", () => ({
    logout: jest.fn(),
}));

jest.mock("../../assets/pulse-ops-logo.png", () => "test-file-stub");

describe("Header Component", () => {
    const mockNavigate = jest.fn();
    const mockDispatch = jest.fn();
    const mockUser = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
        (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
        (useAppSelector as jest.Mock).mockReturnValue({ user: mockUser });
    });

    it("renders the logo and title", () => {
        render(<Header handleDrawerToggle={jest.fn()} />);
        expect(screen.getByAltText("Pulse Ops")).toBeInTheDocument();
        expect(screen.getByText("Pulse Ops")).toBeInTheDocument();
    });

    it("displays the user's name", () => {
        render(<Header handleDrawerToggle={jest.fn()} />);
        expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("opens user dropdown when clicked", () => {
        render(<Header handleDrawerToggle={jest.fn()} />);
        const userButton = screen.getByText("John Doe").closest("button");
        fireEvent.click(userButton!);

        expect(screen.getByText("My Profile")).toBeInTheDocument();
        expect(screen.getByText("Settings")).toBeInTheDocument();
        expect(screen.getByText("Sign Out")).toBeInTheDocument();
    });

    it("calls handleLogout when Sign Out is clicked", async () => {
        render(<Header handleDrawerToggle={jest.fn()} />);
        const userButton = screen.getByText("John Doe").closest("button");
        fireEvent.click(userButton!);

        const signOutButton = screen.getByText("Sign Out");
        fireEvent.click(signOutButton);

        expect(mockDispatch).toHaveBeenCalledWith(logout());
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
        });
    });

    it("opens notification dropdown when clicked", () => {
        render(<Header handleDrawerToggle={jest.fn()} />);

        // Find by the unread count badge as it's a unique element in the button
        const unreadBadge = screen.getByText("2"); // 2 notifications are unread in the dummy data
        const notificationButton = unreadBadge.closest("button");

        fireEvent.click(notificationButton!);
        expect(screen.getByText("Notifications")).toBeInTheDocument();
    });

    it("calls handleDrawerToggle on mobile menu click", () => {
        const handleDrawerToggle = jest.fn();
        render(<Header handleDrawerToggle={handleDrawerToggle} />);

        const menuButton = screen.getByLabelText("Open menu");
        fireEvent.click(menuButton);

        expect(handleDrawerToggle).toHaveBeenCalled();
    });
});
