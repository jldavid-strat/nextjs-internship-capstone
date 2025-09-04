import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate } from '@/lib/utils/format_date';
import { ProjectMemberData } from '@/types/db.types';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';

export const projectMemberColumns = (canMutate: boolean): ColumnDef<ProjectMemberData>[] => [
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
  ...(canMutate ? actionColumn : []),
];

const actionColumn: ColumnDef<ProjectMemberData>[] = [
  {
    id: 'actions',
    cell: ({ row }) => {
      const member = row.original;
      const handleChangeRole = () => {
        console.log('Change role for:', member.userId);
      };

      const handleRemove = () => {
        console.log('Remove member:', member.userId);
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
