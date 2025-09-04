'use client';

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { flexRender, Row, Table as TanstackTable } from '@tanstack/react-table';
interface DataTableProps<TData> {
  table: TanstackTable<TData>;
  columnsLength: number;

  // optional rows to render
  filteredRows?: Row<TData>[];
}

export function DataTable<TData>({ table, columnsLength, filteredRows }: DataTableProps<TData>) {
  return (
    <div className="border-border bg-card rounded-md border-1">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="text-center">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {(filteredRows ?? table.getRowModel().rows).length > 0 ? (
            (filteredRows ?? table.getRowModel().rows).map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="text-center">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columnsLength} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
