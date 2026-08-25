import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Table from "./Table";

interface Data {
    id: number;
    name: string;
    role: string;
}

const columns = [
    { id: "name", label: "Name" },
    { id: "role", label: "Role" },
];

const data: Data[] = [
    { id: 1, name: "Alice", role: "Admin" },
    { id: 2, name: "Bob", role: "User" },
];

describe("Table Component", () => {
    it("renders headers and data correctly", () => {
        render(<Table columns={columns} rows={data} />);

        expect(screen.getByText("Name")).toBeInTheDocument();
        expect(screen.getByText("Role")).toBeInTheDocument();
        expect(screen.getByText("Alice")).toBeInTheDocument();
        expect(screen.getByText("Bob")).toBeInTheDocument();
    });

    it("handles custom formatting", () => {
        const customColumns = [
            {
                id: "name",
                label: "Name",
                format: (value: unknown) => <b>{value as string}</b>
            }
        ];

        const { container } = render(<Table columns={customColumns} rows={data} />);
        expect(container.querySelector("b")).toHaveTextContent("Alice");
    });

    it("handles row clicks", async () => {
        const handleRowClick = jest.fn();
        render(<Table columns={columns} rows={data} onRowClick={handleRowClick} />);

        const aliceRow = screen.getByText("Alice").closest("tr");
        if (aliceRow) {
            await userEvent.click(aliceRow);
        }

        expect(handleRowClick).toHaveBeenCalledTimes(1);
        expect(handleRowClick).toHaveBeenCalledWith(data[0]);
    });
});
