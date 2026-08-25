import { render, screen } from "@testing-library/react";
import Card from "./Card";

describe("Card Component", () => {
    it("renders correctly with children", () => {
        render(<Card>Card Content</Card>);
        expect(screen.getByText("Card Content")).toBeInTheDocument();
    });

    it("displays title and subtitle when provided", () => {
        render(
            <Card title="Card Title" subtitle="Card Subtitle">
                Content
            </Card>
        );
        expect(screen.getByText("Card Title")).toBeInTheDocument();
        expect(screen.getByText("Card Subtitle")).toBeInTheDocument();
    });

    it("renders action element when provided", () => {
        render(
            <Card
                title="Title"
                action={<button data-testid="action-btn">Action</button>}
            >
                Content
            </Card>
        );
        expect(screen.getByTestId("action-btn")).toBeInTheDocument();
    });

    it("applies variant classes", () => {
        const { container } = render(<Card variant="bordered">Content</Card>);
        expect(container.firstChild).toHaveClass("border border-border");
    });

    it("passes additional className", () => {
        const { container } = render(<Card className="custom-class">Content</Card>);
        expect(container.firstChild).toHaveClass("custom-class");
    });
});
