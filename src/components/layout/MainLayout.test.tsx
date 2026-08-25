import { render, screen, fireEvent } from "@testing-library/react";
import MainLayout from "./MainLayout";

// Mock sub-components
jest.mock("./Header", () => ({
    __esModule: true,
    default: ({ handleDrawerToggle }: { handleDrawerToggle: () => void }) => (
        <header data-testid="header">
            <button onClick={handleDrawerToggle}>Toggle</button>
        </header>
    ),
}));

jest.mock("./Sidebar", () => ({
    __esModule: true,
    default: ({ mobileOpen }: { mobileOpen: boolean }) => (
        <aside data-testid="sidebar" data-mobile-open={mobileOpen}>Sidebar</aside>
    ),
}));

jest.mock("./Footer", () => ({
    __esModule: true,
    default: () => <footer data-testid="footer">Footer</footer>,
}));

jest.mock("../common/GlobalLoader", () => ({
    __esModule: true,
    default: () => <div data-testid="global-loader">Loader</div>,
}));

jest.mock("react-router-dom", () => ({
    Outlet: () => <div data-testid="outlet">Outlet</div>,
}));

describe("MainLayout Component", () => {
    it("renders header, sidebar, footer and outlet", () => {
        render(<MainLayout />);

        expect(screen.getByTestId("header")).toBeInTheDocument();
        expect(screen.getByTestId("sidebar")).toBeInTheDocument();
        // Since there are two Footers (one for mobile, one for desktop in the JSX structure)
        expect(screen.getAllByTestId("footer").length).toBe(2);
        expect(screen.getAllByTestId("outlet").length).toBe(2);
        expect(screen.getByTestId("global-loader")).toBeInTheDocument();
    });

    it("toggles mobile open state when header button is clicked", () => {
        render(<MainLayout />);

        const sidebar = screen.getByTestId("sidebar");
        expect(sidebar.getAttribute("data-mobile-open")).toBe("false");

        const toggleButton = screen.getByText("Toggle");
        fireEvent.click(toggleButton);

        expect(sidebar.getAttribute("data-mobile-open")).toBe("true");
    });
});
