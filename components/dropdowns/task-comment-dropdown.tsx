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
import { Task, TaskComment } from '@/types/db.types';
import { DeleteAlertDialog } from '../alerts/delete-alert-dialog';
import { useQueryClient } from '@tanstack/react-query';
import { deleteTaskComment } from '@/actions/task_comment.actions';
import { toast } from 'sonner';

export type TaskCommentDropdownProps = {
  taskId: Task['id'];
  taskCommentId: TaskComment['id'];
  authorId: TaskComment['authorId'];
  content: TaskComment['content'];
  setIsEditing: (i: number | null) => void;
};

export default function TaskCommentDropdown({
  taskCommentData,
}: {
  taskCommentData: TaskCommentDropdownProps;
}) {
  const { taskId, setIsEditing, taskCommentId } = taskCommentData;
  const _queryClient = useQueryClient();

  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);

  async function handleTasCommentDelete(taskCommentId: TaskComment['id']) {
    console.log('delete', taskCommentId);
    const response = await deleteTaskComment(taskCommentId);
    if (response.success) {
      _queryClient.invalidateQueries({
        queryKey: ['task-comments', taskId],
      });
      setIsDeleteOpen(false);
      toast.success('Deleted task comment successfully');
      return;
    }
    toast.success('Failed to task comment');
    return;
  }
  return (
    <>
      <DeleteAlertDialog<TaskComment['id']>
        id={taskCommentId}
        alertDescription="This action cannot be undone. This will delete the task comment"
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        handleDelete={handleTasCommentDelete}
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
              setIsEditing(taskCommentId);
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
