'use client';

import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { DataTable } from './data-table';
import { ProjectLabelData } from '@/types/db.types';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { DataTablePagination } from './data-table-pagination';

type ProjectLabelTableData = Omit<ProjectLabelData, 'taskId' | 'updatedAt'>;

function useProjectLabelColumns(canModify: boolean): ColumnDef<ProjectLabelTableData>[] {
  const baseColumns: ColumnDef<ProjectLabelTableData>[] = [
    {
      accessorKey: 'labelName',
      header: () => <div className="text-center">Label</div>,
      cell: ({ row }) => {
        const label = row.original;
        return (
          <div className="flex flex-row items-center justify-center gap-2">
            <Badge
              className="text-sm"
              style={{ color: label.color ?? '#017de2' }}
              variant="outline"
            >
              {label.labelName}
            </Badge>
          </div>
        );
      },
    },
  ];

  if (canModify) {
    baseColumns.push({
      id: 'actions',
      cell: ({ row }) => {
        const label = row.original;
        return (
          <div className="flex flex-row items-center justify-center gap-2">
            <Button variant="outline" onClick={() => console.log('Edit:', label.labelId)}>
              Edit
            </Button>
            <Button
              className="border-destructive/60 dark:text-foreground border-1 bg-red-500/20 text-red-500 hover:bg-red-500/30"
              onClick={() => console.log('Delete:', label.labelId)}
            >
              Delete
            </Button>
          </div>
        );
      },
    });
  }

  return baseColumns;
}

export function ProjectLabelDataTable({ data }: { data: ProjectLabelTableData[] }) {
  const [globalFilter, setGlobalFilter] = useState<string>('');

  const columns = useProjectLabelColumns(false);
  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    globalFilterFn: (row, _columnId, filterValue) => {
      if (!filterValue) return true;
      // finding rows that fit the search term
      const search = filterValue.toLowerCase();
      return Object.values(row.original).some((value) =>
        String(value).toLowerCase().includes(search),
      );
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="mb-4 flex w-full items-center">
        <Input
          placeholder="Search labels..."
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      <DataTable<ProjectLabelTableData> table={table} columnsLength={columns.length} />

      {/* Pagination */}
      <DataTablePagination table={table} />
    </div>
  );
}
