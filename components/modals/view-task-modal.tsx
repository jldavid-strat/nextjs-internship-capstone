'use client';

import { TaskCardData } from '@/types/types';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet';
import EditTaskInfoForm from '../forms/edit-task-info-form';
import { Project, Task } from '@/types/db.types';
import { useSheetStore } from '@/stores/modal-store';
import { useEffect } from 'react';

export type ViewTaskModalProps = {
  taskData: TaskCardData;
  kanbanData: {
    projectId: Project['id'];
    taskId: Task['id'];
    statusList: string[];
  };
};

export default function ViewTaskModal() {
  const { isTaskOpen, close, taskSheetData } = useSheetStore();

  // manage scroll-lock override when submitting edit task info form
  useEffect(() => {
    if (isTaskOpen) {
      document.body.style.overflow = 'auto';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isTaskOpen]);

  if (!taskSheetData) return;

  return (
    <Sheet open={isTaskOpen} onOpenChange={(o) => (o ? undefined : close())}>
      <SheetContent
        side="right"
        className="max-h-screen w-[1200px] max-w-none overflow-y-scroll sm:w-[540px]"
      >
        <SheetHeader className="pb-0">
          <SheetTitle>Task Details</SheetTitle>
          <SheetDescription>View or make changes to your the task here.</SheetDescription>
        </SheetHeader>

        <EditTaskInfoForm
          kanbanData={taskSheetData.kanbanData}
          taskInfoData={taskSheetData.taskData}
        />
      </SheetContent>
    </Sheet>
  );
}
