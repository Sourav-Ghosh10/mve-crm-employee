import { render, screen } from "@testing-library/react";
import Footer from "./Footer";

describe("Footer Component", () => {
    it("renders the copyright text with current year", () => {
        render(<Footer />);
        const currentYear = new Date().getFullYear().toString();
        expect(screen.getByText(new RegExp(currentYear))).toBeInTheDocument();
        expect(screen.getByText(/Pulse Ops. All rights reserved/i)).toBeInTheDocument();
    });
});
