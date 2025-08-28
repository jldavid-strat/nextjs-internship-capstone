'use c client';

import { Table, TableBody, TableRow, TableCell, TableHeader } from '@/components/ui/table';
import { SELECT_ROLE_VALUES } from '@/lib/db/schema/enums';
import { ProjectMemberData, User } from '@/types/db.types';
import { capitalize } from 'lodash';
import { X } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '../ui/badge';
import { formatDate } from '@/lib/utils/format_date';

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
          </TableRow>
        </TableHeader>
        <TableBody>
          {projectMembers.map((member) => (
            <TableRow key={member.userId}>
              <TableCell>
                <div key={member.userId} className="flex items-center gap-3 px-3 py-2">
                  {member.userImgLink && (
                    <Image
                      src={member.userImgLink}
                      width={32}
                      height={32}
                      alt={`${member.firstName} ${member.lastName}`}
                      className="rounded-full"
                    />
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
                  {/* <p className="">Role:</p>
                  {/* <p className="">Role:</p>
                  <select
                    name="role"
                    defaultValue={member.role}
                    // onChange={() => handleRoleChange ?? {}}
                    className="border-border bg-card rounded-lg border px-3 py-2 focus:outline-hidden focus-visible:ring"
                  >
                    {
                      // exclude owner as selectable role
                      SELECT_ROLE_VALUES.filter((v) => v !== 'owner').map((role, index) => (
                        <option key={index} value={role}>
                          {capitalize(role)}
                        </option>
                      ))
                    }
                  </select> */}
                </div>
              </TableCell>
              <TableCell>
                <p className="text-center">{formatDate(member.joinedAt!)}</p>
              </TableCell>
              {/* <TableCell>
                <button
                  type="button"
                  //   onClick={() => handleRemove ?? {}}
                  className="hover:bg-destructive hover:text-destructive-foreground ml-1 inline-flex cursor-pointer items-center justify-center rounded-sm"
                >
                  <X size={16} />
                </button>
              </TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
