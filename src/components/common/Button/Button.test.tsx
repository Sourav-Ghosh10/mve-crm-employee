import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "./Button";

describe("Button Component", () => {
    it("renders correctly with default props", () => {
        render(<Button>Click Me</Button>);
        const button = screen.getByRole("button", { name: /click me/i });
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass("bg-gradient-to-r");
    });

    it("handles click events", async () => {
        const handleClick = jest.fn();
        render(<Button onClick={handleClick}>Click Me</Button>);
        const button = screen.getByRole("button", { name: /click me/i });

        await userEvent.click(button);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("displays start and end icons", () => {
        render(
            <Button
                startIcon={<span data-testid="start-icon">Start</span>}
                endIcon={<span data-testid="end-icon">End</span>}
            >
                Label
            </Button>
        );

        expect(screen.getByTestId("start-icon")).toBeInTheDocument();
        expect(screen.getByTestId("end-icon")).toBeInTheDocument();
    });

    it("applies fullWidth class when prop is true", () => {
        render(<Button fullWidth>Full Width</Button>);
        const button = screen.getByRole("button");
        expect(button).toHaveClass("w-full");
    });

    it("is disabled when disabled prop is true", () => {
        render(<Button disabled>Disabled</Button>);
        const button = screen.getByRole("button");
        expect(button).toBeDisabled();
        expect(button).toHaveClass("disabled:opacity-50");
    });
});
