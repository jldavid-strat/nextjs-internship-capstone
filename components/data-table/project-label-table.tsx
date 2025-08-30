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
import { projectLabelColumns } from '@/components/data-table/columns/project-labels-columns';

export type ProjectLabelTableData = Omit<ProjectLabelData, 'taskId' | 'updatedAt'>;

export function ProjectLabelDataTable({
  data,
  canMutate,
}: {
  data: ProjectLabelTableData[];
  canMutate: boolean;
}) {
  const [globalFilter, setGlobalFilter] = useState<string>('');

  const columns = projectLabelColumns(canMutate);

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
