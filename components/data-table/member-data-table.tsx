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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from './data-table';
import { ProjectMemberData } from '@/types/db.types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { formatDate } from '@/lib/utils/format_date';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/button';
import { DataTablePagination } from './data-table-pagination';

const columns: ColumnDef<ProjectMemberData>[] = [
  {
    accessorKey: 'member',
    header: () => <div className="text-center">Member</div>,
    cell: ({ row }) => {
      const member = row.original;
      return (
        <div className="flex gap-3 px-3 py-2 text-left">
          <Avatar className="h-8 w-8">
            <AvatarImage src={member.userImgLink} alt={`${member.firstName} ${member.lastName}`} />
            <AvatarFallback>
              {member.firstName.charAt(0)}
              {member.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">
              {member.firstName} {member.lastName}
            </p>
            <p className="text-muted-foreground truncate text-sm">{member.primaryEmailAddress}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'role',
    header: () => <div className="text-center">Role</div>,
    cell: ({ row }) => (
      <div className="flex flex-row items-center justify-center gap-2">
        <Badge className="text-sm text-gray-500" variant="outline">
          {row.original.role}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: 'joinedAt',
    header: () => <div className="text-center">Date Joined</div>,
    cell: ({ row }) => <p className="text-center">{formatDate(row.original.joinedAt!)}</p>,
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const member = row.original;
      const handleChangeRole = () => {
        console.log('Change role for:', member.userId);
        // 🔥 Call your server action or mutation here
      };

      const handleRemove = () => {
        console.log('Remove member:', member.userId);
        // 🔥 Call your server action or mutation here
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleChangeRole}>Change Role</DropdownMenuItem>
            <DropdownMenuItem onClick={handleRemove}>Remove</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function MemberDataTable({ data }: { data: ProjectMemberData[] }) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

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
