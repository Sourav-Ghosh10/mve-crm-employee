import { render, screen, fireEvent } from "@testing-library/react";
import AttendanceHero from "./AttendanceHero";

describe("AttendanceHero Component", () => {
    const defaultProps = {
        status: "not_clocked" as const,
        currentTime: new Date("2023-01-01T10:00:00"),
        lastActionTime: null,
        workingHoursFormatted: "00:00:00",
        loading: false,
        initialLoading: false,
        onClockIn: jest.fn(),
        onClockOut: jest.fn(),
        onBreakStart: jest.fn(),
        onBreakResume: jest.fn(),
        formatTime: (date: Date) => date.toLocaleTimeString(),
    };

    it("renders 'Clock In' button when status is not_clocked", () => {
        render(<AttendanceHero {...defaultProps} />);
        expect(screen.getByText("Clock In")).toBeInTheDocument();
        expect(screen.queryByText("Start Break")).not.toBeInTheDocument();
        expect(screen.queryByText("Clock Out")).not.toBeInTheDocument();
    });

    it("calls onClockIn when 'Clock In' button is clicked", () => {
        render(<AttendanceHero {...defaultProps} />);
        fireEvent.click(screen.getByText("Clock In"));
        expect(defaultProps.onClockIn).toHaveBeenCalled();
    });

    it("renders 'Start Break' and 'Clock Out' when status is clock_in", () => {
        render(<AttendanceHero {...defaultProps} status="clock_in" lastActionTime={new Date()} />);
        expect(screen.getByText("Start Break")).toBeInTheDocument();
        expect(screen.getByText("Clock Out")).toBeInTheDocument();
    });

    it("renders 'Resume Work' and does not render 'Clock Out' when status is on_break", () => {
        render(<AttendanceHero {...defaultProps} status="on_break" lastActionTime={new Date()} breakDurationFormatted="00:15:00" />);
        expect(screen.getByText("Resume Work")).toBeInTheDocument();
        expect(screen.queryByText("Clock Out")).not.toBeInTheDocument();
        expect(screen.getByText("00:15:00")).toBeInTheDocument();
    });

    it("shows loading state in button when loading is true", () => {
        render(<AttendanceHero {...defaultProps} loading={true} />);
        const button = screen.getByText("Clock In");
        expect(button.closest("button")).toBeDisabled();
    });

    it("shows checking status when initialLoading is true", () => {
        render(<AttendanceHero {...defaultProps} initialLoading={true} />);
        expect(screen.getByText("Checking status...")).toBeInTheDocument();
    });

    it("displays the formatted working hours when working", () => {
        const workingHours = "04:30:00";
        render(<AttendanceHero {...defaultProps} status="present" lastActionTime={new Date()} workingHoursFormatted={workingHours} />);
        expect(screen.getByText(workingHours)).toBeInTheDocument();
    });
});
