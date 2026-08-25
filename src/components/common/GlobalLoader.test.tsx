import { render, screen } from "@testing-library/react";
import GlobalLoader from "./GlobalLoader";
import { useAppSelector } from "../../store/hooks";

// Mock the hook
jest.mock("../../store/hooks", () => ({
    useAppSelector: jest.fn(),
}));

describe("GlobalLoader Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders null when isLoading is false", () => {
        (useAppSelector as jest.Mock).mockReturnValue(false);
        const { container } = render(<GlobalLoader />);
        expect(container).toBeEmptyDOMElement();
        expect(document.body.style.overflow).toBe("");
    });

    it("renders correctly when isLoading is true", () => {
        (useAppSelector as jest.Mock).mockReturnValue(true);
        render(<GlobalLoader />);

        expect(screen.getByText("Pulse Ops")).toBeInTheDocument();
        expect(screen.getByText("Processing")).toBeInTheDocument();
        expect(document.body.style.overflow).toBe("hidden");
    });

    it("restores body overflow on unmount", () => {
        (useAppSelector as jest.Mock).mockReturnValue(true);
        const { unmount } = render(<GlobalLoader />);
        expect(document.body.style.overflow).toBe("hidden");

        unmount();
        expect(document.body.style.overflow).toBe("");
    });
});
