'use c client';

import { Table, TableBody, TableRow, TableCell, TableHeader } from '@/components/ui/table';
import { SELECT_ROLE_VALUES } from '@/lib/db/schema/enums';
import { ProjectMemberData, User } from '@/types/db.types';
import { capitalize } from 'lodash';
import { MoreHorizontal, X } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '../ui/badge';
import { formatDate } from '@/lib/utils/format_date';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';

type ProjectMemberTableProps = {
  projectMembers: ProjectMemberData[];
  handleRemove?: (memberId: User['id']) => void;
  handleRoleChange?: (role: ProjectMemberData['role']) => void;
};

export default function ProjectMemberTable({
  projectMembers,
  handleRemove,
  handleRoleChange,
}: ProjectMemberTableProps) {
  return (
    <div className="bg-input/30 rounded-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell className="text-center">Member</TableCell>
            <TableCell className="text-center">Role</TableCell>
            <TableCell className="text-center">Date Joined</TableCell>
            <TableCell className="text-center"></TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projectMembers.map((member) => (
            <TableRow key={member.userId}>
              <TableCell>
                <div key={member.userId} className="flex items-center gap-3 px-3 py-2">
                  {member.userImgLink && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={member.userImgLink}
                        alt={`${member.firstName} ${member.lastName}`}
                      />
                      <AvatarFallback>
                        {member.firstName.charAt(0)}
                        {member.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-muted-foreground truncate text-sm">
                      {member.primaryEmailAddress}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-row items-center justify-center gap-2">
                  <Badge className="text-sm text-gray-500" variant={'outline'}>
                    {capitalize(member.role)}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <p className="text-center">{formatDate(member.joinedAt!)}</p>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Change Role</DropdownMenuItem>
                    <DropdownMenuItem>Remove</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
