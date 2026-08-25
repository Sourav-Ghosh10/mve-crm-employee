import { render, screen, fireEvent } from "@testing-library/react";
import ErrorAlert from "./ErrorAlert";

describe("ErrorAlert Component", () => {
    it("renders null when no error is provided", () => {
        const { container } = render(<ErrorAlert error={null} onClear={() => { }} />);
        expect(container).toBeEmptyDOMElement();
    });

    it("renders error message correctly", () => {
        const errorMessage = "Something went wrong";
        render(<ErrorAlert error={errorMessage} onClear={() => { }} />);

        expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it("calls onClear when closed button is clicked", () => {
        const onClear = jest.fn();
        render(<ErrorAlert error="Error" onClear={onClear} />);

        const closeButton = screen.getByRole("button");
        fireEvent.click(closeButton);

        expect(onClear).toHaveBeenCalledTimes(1);
    });

    it("shows the error icon", () => {
        // Since AlertCircle is a component from lucide-react, it'll render an svg.
        // We can just check for existence in the DOM if we don't mock it.
        const { container } = render(<ErrorAlert error="Error" onClear={() => { }} />);
        const svg = container.querySelector("svg");
        expect(svg).toBeInTheDocument();
    });
});
