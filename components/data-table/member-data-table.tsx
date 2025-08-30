'use client';

import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from './data-table';
import { ProjectMemberData } from '@/types/db.types';
import { DataTablePagination } from './data-table-pagination';
import { projectMemberColumns } from '@/components/data-table/columns/project-member-columns';

export function MemberDataTable({
  data,
  canMutate,
}: {
  data: ProjectMemberData[];
  canMutate: boolean;
}) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const columns = projectMemberColumns(canMutate);

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = filterValue.toLowerCase();
      return Object.values(row.original).some((value) =>
        String(value).toLowerCase().includes(search),
      );
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // member role filtering
  const filteredData =
    roleFilter === 'all'
      ? table.getRowModel().rows
      : table.getRowModel().rows.filter((row) => row.original.role.toLowerCase() === roleFilter);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex w-full items-center gap-2">
        <Input
          placeholder="Search members..."
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent className="border-border">
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="member">Member</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DataTable<ProjectMemberData>
        table={table}
        columnsLength={columns.length}
        filteredRows={filteredData}
      />

      {/* Pagination */}
      <DataTablePagination table={table} />
    </div>
  );
}
