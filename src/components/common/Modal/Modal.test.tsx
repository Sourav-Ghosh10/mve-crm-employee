import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Modal from "./Modal";

describe("Modal Component", () => {
    const handleClose = jest.fn();

    beforeEach(() => {
        handleClose.mockClear();
    });

    it("does not render when open property is false", () => {
        render(
            <Modal open={false} onClose={handleClose} title="Test Modal">
                Modal Content
            </Modal>
        );
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("renders correctly when open property is true", () => {
        render(
            <Modal open={true} onClose={handleClose} title="Test Modal">
                Modal Content
            </Modal>
        );

        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText("Test Modal")).toBeInTheDocument();
        expect(screen.getByText("Modal Content")).toBeInTheDocument();
    });

    it("calls onClose when close button is clicked", async () => {
        render(
            <Modal open={true} onClose={handleClose} title="Test Modal">
                Modal Content
            </Modal>
        );

        const closeButton = screen.getByLabelText("Close modal");
        await userEvent.click(closeButton);
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when Escape key is pressed", () => {
        render(
            <Modal open={true} onClose={handleClose} title="Test Modal">
                Modal Content
            </Modal>
        );

        fireEvent.keyDown(document, { key: "Escape" });
        expect(handleClose).toHaveBeenCalledTimes(1);
    });
});
