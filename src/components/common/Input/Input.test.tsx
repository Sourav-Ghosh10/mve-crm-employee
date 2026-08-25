import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Input from "./Input";

describe("Input Component", () => {
    it("renders correctly with label", () => {
        render(<Input label="Username" id="username" />);
        expect(screen.getByLabelText("Username")).toBeInTheDocument();
    });

    it("handles user input", async () => {
        render(<Input placeholder="Type here" />);
        const input = screen.getByPlaceholderText("Type here");

        await userEvent.type(input, "Hello World");
        expect(input).toHaveValue("Hello World");
    });

    it("displays helper text", () => {
        render(<Input helperText="Helper message" />);
        expect(screen.getByText("Helper message")).toBeInTheDocument();
    });

    it("applies error styles when error prop is true", () => {
        render(<Input error helperText="Error message" />);
        const input = screen.getByRole("textbox");
        expect(input).toHaveClass("border-error");
        expect(screen.getByText("Error message")).toHaveClass("text-error");
    });

    it("renders start and end adornments", () => {
        render(
            <Input
                startAdornment={<span data-testid="start">Start</span>}
                endAdornment={<span data-testid="end">End</span>}
            />
        );
        expect(screen.getByTestId("start")).toBeInTheDocument();
        expect(screen.getByTestId("end")).toBeInTheDocument();
    });
});
