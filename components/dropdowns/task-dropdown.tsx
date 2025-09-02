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
import React, { useState } from 'react';
import { useSheetStore } from '@/stores/modal-store';
import { EditTaskCardData } from '@/types/types';
import { Project, Task } from '@/types/db.types';
import { deleteTask } from '@/actions/task.actions';
import { DeleteAlertDialog } from '../alerts/delete-alert-dialog';
import { useQueryClient } from '@tanstack/react-query';

export type TaskSheetProps = {
  taskData: EditTaskCardData;
  kanbanData: {
    projectId: Project['id'];
    taskId: Task['id'];
    statusList: string[];
  };
};

export default function TaskCardDropdown({ kanbanData, taskData }: TaskSheetProps) {
  const { projectId, taskId } = kanbanData;
  const _queryClient = useQueryClient();

  const { open: setTaskOpen } = useSheetStore();
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);

  async function handleTaskDelete(deleteTaskID: Task['id']) {
    console.log('delete', deleteTaskID);
    const response = await deleteTask(deleteTaskID, projectId);
    if (response.success) {
      _queryClient.invalidateQueries({
        queryKey: ['tasks', projectId],
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
      <DeleteAlertDialog<number>
        id={taskId}
        alertDescription="This action cannot be undone. This will delete the corresponding task and all the related included in it"
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        handleDelete={handleTaskDelete}
      />
      <DropdownMenu modal={true}>
        <DropdownMenuTrigger asChild>
          <Button
            variant={'outline'}
            className="border-0 bg-transparent dark:bg-transparent"
            onClick={(e) => {
              // to prevent event bubbling from the draggable task card
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <Ellipsis size={12} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            className="flex w-full items-center"
            onSelect={() => {
              setTaskOpen({
                kanbanData: {
                  projectId: kanbanData.projectId,
                  taskId: kanbanData.taskId,
                  statusList: kanbanData.statusList,
                },
                taskData: { ...taskData },
              });
            }}
          >
            <Pencil size={10} />
            <span className="hover: w-full cursor-pointer text-sm">Edit</span>
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
