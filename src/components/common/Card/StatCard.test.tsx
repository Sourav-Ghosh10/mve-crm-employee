import { render, screen } from "@testing-library/react";
import StatCard from "./StatCard";
import { Activity } from "lucide-react";

describe("StatCard Component", () => {
    const defaultProps = {
        title: "Total Projects",
        value: "12",
        icon: <Activity data-testid="stat-icon" />,
        borderColor: "border-primary",
    };

    it("renders correctly with required props", () => {
        render(<StatCard {...defaultProps} />);

        expect(screen.getByText("Total Projects")).toBeInTheDocument();
        expect(screen.getByText("12")).toBeInTheDocument();
        expect(screen.getByTestId("stat-icon")).toBeInTheDocument();
    });

    it("displays trend information when provided", () => {
        const trend = { value: "+5%", positive: true };
        render(<StatCard {...defaultProps} trend={trend} />);

        expect(screen.getByText("+5%")).toBeInTheDocument();
    });

    it("applies positive trend styling", () => {
        const trend = { value: "+5%", positive: true };
        const { container } = render(<StatCard {...defaultProps} trend={trend} />);

        const trendDiv = container.querySelector(".text-success");
        expect(trendDiv).toBeInTheDocument();
        expect(trendDiv).toHaveTextContent("+5%");
    });

    it("applies negative trend styling", () => {
        const trend = { value: "-3%", positive: false };
        const { container } = render(<StatCard {...defaultProps} trend={trend} />);

        const trendDiv = container.querySelector(".text-error");
        expect(trendDiv).toBeInTheDocument();
        expect(trendDiv).toHaveTextContent("-3%");
    });

    it("applies custom background color for icon container", () => {
        render(<StatCard {...defaultProps} bgColor="bg-blue-500" />);
        const iconContainer = screen.getByTestId("stat-icon").parentElement;
        expect(iconContainer).toHaveClass("bg-blue-500");
    });

    it("applies custom className to root element", () => {
        render(<StatCard {...defaultProps} className="custom-class" />);
        const rootElement = screen.getByText("Total Projects").closest("div.custom-class");
        expect(rootElement).toBeInTheDocument();
    });
});
