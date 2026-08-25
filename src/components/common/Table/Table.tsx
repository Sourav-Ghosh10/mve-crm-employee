import React from "react";
import { cn } from "../../../lib/utils";

interface Column<T> {
  id: keyof T | string;
  label: string;
  minWidth?: number;
  align?: "right" | "left" | "center";
  format?: (value: unknown, row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  className?: string;
}

const Table = <T extends { id: string | number }>({
  columns,
  rows,
  onRowClick,
  className,
}: TableProps<T>) => {
  return (
    <div
      className={cn("overflow-auto border border-border rounded-lg", className)}
    >
      <table className="w-full">
        <thead className="bg-muted sticky top-0">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.id)}
                className={cn(
                  "px-4 py-3 text-sm font-semibold text-foreground border-b border-border",
                  column.align === "right" && "text-right",
                  column.align === "center" && "text-center",
                  column.align === "left" && "text-left",
                )}
                style={{ minWidth: column.minWidth }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick && onRowClick(row)}
              className={cn(
                "border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors",
                onRowClick && "cursor-pointer",
              )}
            >
              {columns.map((column) => {
                const value = (row as Record<string, unknown>)[
                  column.id as string
                ];
                return (
                  <td
                    key={String(column.id)}
                    className={cn(
                      "px-4 py-3 text-sm",
                      column.align === "right" && "text-right",
                      column.align === "center" && "text-center",
                      column.align === "left" && "text-left",
                    )}
                  >
                    {column.format
                      ? column.format(value, row)
                      : (value as React.ReactNode)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
