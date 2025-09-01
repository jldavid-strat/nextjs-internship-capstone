'use client';

import { Ellipsis, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import EditKanbaColumnForm from '../forms/edit-kanban-column-modal-form';
import React, { useState } from 'react';
import { DeleteAlertDialog } from '../alerts/delete-alert-dialog';
import { ProjectKanbanColumn } from '@/types/db.types';
import { deleteKanbanColumn } from '@/actions/kanban_column.actions';
import { EditKanbaColumnFormData } from '@/types/types';
import { useQueryClient } from '@tanstack/react-query';

export default function KanbanColumnDropdown({
  kanbanData,
}: {
  kanbanData: EditKanbaColumnFormData;
}) {
  const { projectId, position, description, projectColumnId, name, kanbanColumnId } = kanbanData;
  const _queryClient = useQueryClient();
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);

  async function handleColumnDelete(columnId: ProjectKanbanColumn['id']) {
    console.log('delete', columnId);
    const response = await deleteKanbanColumn(columnId, projectId);
    if (response.success) {
      _queryClient.invalidateQueries({
        queryKey: ['kanban-columns', projectId],
      });
      setIsDeleteOpen(false);
      //   show toast
      return;
    }
    alert(response.error);
    return;
  }
  return (
    <>
      <EditKanbaColumnForm
        isEditOpen={isEditOpen}
        setIsEditOpen={setIsEditOpen}
        kanbanData={{
          kanbanColumnId: kanbanColumnId,
          position: position,
          isCustom: true,
          projectId: projectId,
          projectColumnId: projectColumnId,
          name: name,
          description: description,
        }}
      />
      <DeleteAlertDialog<number>
        id={projectColumnId}
        alertDescription="This action cannot be undone. This will delete the corresponding kanban column and all the task included in it"
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        handleDelete={handleColumnDelete}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={'outline'} className="border-0 bg-transparent dark:bg-transparent">
            <Ellipsis size={12} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem className="flex w-full items-center">
            <Pencil size={10} />
            <span
              className="hover: w-full cursor-pointer text-sm"
              onClick={() => {
                setIsEditOpen(true);
              }}
            >
              Edit
            </span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex w-full items-center">
            <Trash2 size={10} />
            <span
              className="hover: w-full cursor-pointer text-sm"
              onClick={() => {
                setIsDeleteOpen(true);
              }}
            >
              Delete
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
