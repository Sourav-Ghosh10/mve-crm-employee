import { render, screen } from "@testing-library/react";
import LoadingSpinner from "./LoadingSpinner";

describe("LoadingSpinner Component", () => {
    it("renders correctly", () => {
        const { container } = render(<LoadingSpinner />);
        expect(container.firstChild).toHaveClass("flex flex-col");
        // Loader2 from lucide might be rendered as an svg
        expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("displays message when provided", () => {
        render(<LoadingSpinner message="Loading..." />);
        expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("applies fullScreen class when prop is true", () => {
        const { container } = render(<LoadingSpinner fullScreen />);
        expect(container.firstChild).toHaveClass("h-screen");
    });
});
