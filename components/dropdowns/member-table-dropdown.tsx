'use client';

import ChangeMemberRoleForm from '@/components/forms/change-member-role-modal-form';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChangeMemberRole } from '@/lib/db/schema/enums';
import { ProjectMemberData, User } from '@/types/db.types';
import { Row } from '@tanstack/react-table';
import { MoreHorizontal, Trash2, UserRoundPen } from 'lucide-react';
import { useState } from 'react';
import { DeleteAlertDialog } from '../alerts/delete-alert-dialog';
import { removeMember } from '@/actions/project_member.actions';
import { toast } from 'sonner';

export default function MemberTableDropdown({ row }: { row: Row<ProjectMemberData> }) {
  const member = row.original;

  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);

  // exclude owner
  if (member.role === 'owner') return;
  async function handleRemoveMember(userId: User['id']) {
    console.log('Remove member:', member.userId);
    const response = await removeMember(member.projectId, userId);
    if (response.success) {
      setIsDeleteOpen(false);
      toast.success('Removed the member successfully');
      return;
    }
    toast.success('Failed to remove member');
    return;
  }

  return (
    <>
      <DeleteAlertDialog<User['id']>
        id={member.userId}
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        handleDelete={handleRemoveMember}
      />

      <ChangeMemberRoleForm
        isEditOpen={isEditOpen}
        setIsEditOpen={setIsEditOpen}
        projectMemberData={{
          projectId: member.projectId,
          userId: member.userId,
          memberName: `${member.firstName} ${member.lastName}`,
          role: member.role as ChangeMemberRole,
        }}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem className="flex w-full items-center">
            <UserRoundPen size={10} />
            <span
              className="hover: w-full cursor-pointer text-sm"
              onClick={() => {
                setIsEditOpen(true);
              }}
            >
              Change Role
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex w-full items-center">
            <Trash2 size={10} />
            <span
              className="hover: w-full cursor-pointer text-sm"
              onClick={() => {
                setIsDeleteOpen(true);
              }}
            >
              Remove
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
