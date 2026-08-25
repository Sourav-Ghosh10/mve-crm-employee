import { render, screen, fireEvent } from "@testing-library/react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";

// Mock dependencies
jest.mock("react-router-dom", () => ({
    useNavigate: jest.fn(),
    useLocation: jest.fn(),
}));

describe("Sidebar Component", () => {
    const mockNavigate = jest.fn();
    const mockLocation = { pathname: "/" };

    beforeEach(() => {
        jest.clearAllMocks();
        (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
        (useLocation as jest.Mock).mockReturnValue(mockLocation);
    });

    it("renders all menu items", () => {
        render(<Sidebar mobileOpen={false} handleDrawerToggle={jest.fn()} />);
        // Checking for some key items
        expect(screen.getAllByText("Dashboard").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Attendance").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Schedule").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Leave").length).toBeGreaterThan(0);
        expect(screen.getAllByText("My Profile").length).toBeGreaterThan(0);
    });

    it("calls navigate when a menu item is clicked", () => {
        render(<Sidebar mobileOpen={false} handleDrawerToggle={jest.fn()} />);
        const attendanceButton = screen.getAllByText("Attendance")[0].closest("button");
        fireEvent.click(attendanceButton!);

        expect(mockNavigate).toHaveBeenCalledWith("/attendance");
    });

    it("highlights the active menu item", () => {
        (useLocation as jest.Mock).mockReturnValue({ pathname: "/attendance" });
        render(<Sidebar mobileOpen={false} handleDrawerToggle={jest.fn()} />);

        const attendanceButton = screen.getAllByText("Attendance")[0].closest("button");
        expect(attendanceButton).toHaveClass("bg-white/15");
        expect(attendanceButton).toHaveClass("border-accent");
    });

    it("calls handleDrawerToggle when a menu item is clicked in mobile view", () => {
        const handleDrawerToggle = jest.fn();
        render(<Sidebar mobileOpen={true} handleDrawerToggle={handleDrawerToggle} />);

        const attendanceButton = screen.getAllByText("Attendance")[0].closest("button");
        fireEvent.click(attendanceButton!);

        expect(handleDrawerToggle).toHaveBeenCalled();
    });

    it("renders copyright text with current year", () => {
        render(<Sidebar mobileOpen={false} handleDrawerToggle={jest.fn()} />);
        const currentYear = new Date().getFullYear().toString();
        expect(screen.getAllByText(new RegExp(currentYear)).length).toBeGreaterThan(0);
    });
});
