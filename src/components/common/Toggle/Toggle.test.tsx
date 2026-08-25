import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Toggle from "./Toggle";

describe("Toggle Component", () => {
    it("renders correctly with correct aria-checked state", () => {
        const handleChange = jest.fn();
        const { rerender } = render(
            <Toggle enabled={false} onChange={handleChange} />
        );

        const toggle = screen.getByRole("switch");
        expect(toggle).toBeInTheDocument();
        expect(toggle).toHaveAttribute("aria-checked", "false");

        rerender(<Toggle enabled={true} onChange={handleChange} />);
        expect(toggle).toHaveAttribute("aria-checked", "true");
    });

    it("calls onChange when clicked", async () => {
        const handleChange = jest.fn();
        render(<Toggle enabled={false} onChange={handleChange} />);

        const toggle = screen.getByRole("switch");
        await userEvent.click(toggle);

        expect(handleChange).toHaveBeenCalledTimes(1);
        expect(handleChange).toHaveBeenCalledWith(true);
    });

    it("does not call onChange when disabled", async () => {
        const handleChange = jest.fn();
        render(<Toggle enabled={false} onChange={handleChange} disabled />);

        const toggle = screen.getByRole("switch");
        expect(toggle).toBeDisabled();

        await userEvent.click(toggle);
        expect(handleChange).not.toHaveBeenCalled();
    });
});
