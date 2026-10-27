import React from "react";
import { cn } from "../../../lib/utils";

export interface Column<T = any> {
  id?: keyof T | string;
  _id?: string;
  label: string;
  minWidth?: number;
  align?: "right" | "left" | "center";
  format?: (value: any, row: T) => React.ReactNode;
}

export interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  className?: string;
  tableClassName?: string;
  keyField?: string;
  emptyState?: React.ReactNode;
  isRowClickable?: (row: T) => boolean;
  rowClassName?: (row: T) => string;
}

const Table = <T extends Record<string, any>>({
  columns,
  rows,
  onRowClick,
  className,
  tableClassName,
  keyField,
  emptyState,
  isRowClickable,
  rowClassName,
}: TableProps<T>) => {
  if ((!rows || rows.length === 0) && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div
      className={cn("overflow-auto border border-border rounded-lg", className)}
    >
      <table className={cn("w-full", tableClassName)}>
        <thead className="bg-muted sticky top-0">
          <tr>
            {columns.map((column, colIdx) => (
              <th
                key={String(column.id || column._id || colIdx)}
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
          {rows.map((row, idx) => {
            const rowKey = keyField
              ? row[keyField]
              : row.id || row._id || idx;
            const clickable = isRowClickable ? isRowClickable(row) : Boolean(onRowClick);

            return (
              <tr
                key={String(rowKey)}
                onClick={() => clickable && onRowClick && onRowClick(row)}
                className={cn(
                  "border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors",
                  clickable && "cursor-pointer",
                  rowClassName && rowClassName(row)
                )}
              >
                {columns.map((column, colIdx) => {
                  const key = (column.id || column._id) as string;
                  const value = key ? (row as Record<string, unknown>)[key] : undefined;
                  return (
                    <td
                      key={String(key || colIdx)}
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export type { Column as TableColumn };
export default Table;
