import { render, screen } from "@testing-library/react";
import EmptyState from "./EmptyState";

describe("EmptyState Component", () => {
    it("renders with default props", () => {
        render(<EmptyState />);
        expect(screen.getByText("No Data Found")).toBeInTheDocument();
        expect(screen.getByText("There are no items to display.")).toBeInTheDocument();
    });

    it("renders with custom title and description", () => {
        render(<EmptyState title="Nothing here" description="Custom description" />);
        expect(screen.getByText("Nothing here")).toBeInTheDocument();
        expect(screen.getByText("Custom description")).toBeInTheDocument();
    });

    it("renders with action button", () => {
        render(
            <EmptyState
                action={<button>Create</button>}
            />
        );
        expect(screen.getByText("Create")).toBeInTheDocument();
    });
});
