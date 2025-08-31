'use client';

import { createTask } from '@/actions/task.actions';
import { startTransition, useActionState, useCallback, useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { InserFormTaskSchema, InserFormTaskType } from '@/lib/validations/task.validations';
import { zodResolver } from '@hookform/resolvers/zod';
import { TASK_PRIORITY_VALUES } from '@/lib/db/schema/enums';
import { Input } from '../ui/input';
import MarkdownEditor from '../markdown/markdown-editor';
import { Button } from '../ui/button';
import { capitalize } from 'lodash';
import { DialogClose } from '../ui/dialog';
import { ErrorBox } from '../ui/error-box';
import { AddLabelMultiSelect } from '../ui/add-label-multi-select';
import { getProjectLabels } from '@/actions/project_labels.actions';
import { ProjectLabelTableData } from '../data-table/project-label-table';
import { getProjectMembers } from '@/actions/project_member.actions';
import { User } from '@/types/db.types';
import { AddUserMultiSelect } from '../ui/add-user-multi-select';
import { FilePlus2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

// Integration:
// - Use task validation schema
// - Call task creation/update API
// - Update board state optimistically
// - Handle file uploads
// - Real-time updates for comments
// */

// TODO add toast promise to UNDO mutation via drizzle transaction

export type CreateTaskProps = {
  kanbanColumnId: string;
  projectId: string;
  kanbanName: string;
  statusList: string[];
};

export function AddTaskForm({ kanbanData }: { kanbanData: CreateTaskProps }) {
  const [state, createTaskAction, isPending] = useActionState(
    createTask.bind(null, kanbanData),
    undefined,
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<InserFormTaskType>({
    resolver: zodResolver(InserFormTaskSchema),
    defaultValues: {
      priority: 'none',
      status: kanbanData.kanbanName,
      detail: '',
      labels: [],
      assignees: [],
    },
  });

  const _queryClient = useQueryClient();

  const [errorCount, setErrorCount] = useState(0);

  const formRef = useRef(null);

  const onSubmitHandler = (data: InserFormTaskType) => {
    const formData = new FormData();

    formData.append('title', data.title);
    formData.append('description', data.description ?? '');
    formData.append('detail', data.detail ?? '');
    formData.append('start-date', data.startDate ?? '');
    formData.append('priority', data.priority);
    formData.append('due-date', data.dueDate ?? '');
    formData.append('status', data.status);
    formData.append('labels', JSON.stringify([...(data.labels ?? [])]));
    formData.append('assignees', JSON.stringify([...(data.assignees ?? [])]));

    // console.log(formData);

    startTransition(() => createTaskAction(formData));
  };
  const fetchProjectLabels = useCallback(
    async (searchTerm: string): Promise<ProjectLabelTableData[]> => {
      return (await getProjectLabels(kanbanData.projectId, searchTerm)) ?? [];
    },
    [kanbanData.projectId],
  );
  const fetchProjectMembers = useCallback(
    async (searchTerm: string): Promise<User[]> => {
      const maxCount = 4;
      const projectMembers =
        (await getProjectMembers(kanbanData.projectId, searchTerm, maxCount)) ?? [];

      const userData = projectMembers.map((u) => u.userData);
      return userData;
    },
    [kanbanData.projectId],
  );

  useEffect(() => {
    if (state?.success === false && state?.error) {
      //   always increment on unsuccesful attempt
      setErrorCount((prev) => prev + 1);
    }
    if (state?.success === true) {
      _queryClient.invalidateQueries({
        queryKey: ['tasks', kanbanData.projectId],
      });
      console.log('succesful added');
      //   toast
    }
  }, [state, _queryClient, kanbanData.projectId]);

  return (
    <>
      <div className="mb-4 flex items-center gap-2">
        <FilePlus2 size={20} className="text-primary" />
        <h3 className="text-primary text-lg font-medium">Create New Task</h3>
      </div>
      <form ref={formRef} onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Task Title *</label>
          {/* TODO: add way to auto-focus title input */}
          <Input {...register('title')} type="text" name="title" placeholder="Enter task title" />
          <p className="mt-2 text-sm text-red-400">{errors.title?.message}</p>
        </div>
        <div>
          <label className="text-outer_space-500 dark:text-platinum-500 mb-2 block text-sm font-medium">
            Description
          </label>
          <textarea
            {...register('description')}
            name="description"
            rows={2}
            className="focus:ring-visible border-border bg-input/30 w-full rounded-lg border px-3 py-2 text-sm focus:outline-hidden"
            placeholder="Concisely describe what the task is about"
          />
          <p className="mt-2 text-sm text-red-400">{errors.description?.message}</p>
        </div>
        <section className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-outer_space-500 dark:text-platinum-500 mb-2 block text-sm font-medium">
              Start Date
            </label>
            <Input
              {...register('startDate', { setValueAs: (val) => (val === '' ? null : val) })}
              type="date"
              name="startDate"
              className="w-[180px]"
            />
          </div>
          <div className="items-center gap-2">
            <label className="mb-2 block text-sm font-medium">Status</label>
            <select
              {...register('status')}
              name="priority"
              className="bg-card border-border h-8 w-[180px] rounded-lg border px-2 focus:outline-hidden focus-visible:ring"
            >
              {kanbanData.statusList.map((status, index) => (
                <option key={index} value={status}>
                  {capitalize(status)}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Due Date</label>
            <Input
              {...register('dueDate', { setValueAs: (val) => (val === '' ? null : val) })}
              type="date"
              name="dueDate"
              className="w-[180px]"
            />
          </div>
          <div className="items-center gap-2">
            <label className="mb-2 block text-sm font-medium">Priority</label>
            <select
              {...register('priority')}
              name="priority"
              className="bg-card border-border h-8 w-[180px] rounded-lg border px-2 focus:outline-hidden focus-visible:ring"
            >
              {TASK_PRIORITY_VALUES.map((priority, index) => (
                <option key={index} value={priority}>
                  {capitalize(priority)}
                </option>
              ))}
            </select>
          </div>
        </section>

        <p className="mt-2 text-sm text-red-400">{errors.dueDate?.message}</p>
        <p className="mt-2 text-sm text-red-400">{errors.startDate?.message}</p>
        <p className="mt-2 text-sm text-red-400">{errors.priority?.message}</p>
        <p className="mt-2 text-sm text-red-400">{errors.status?.message}</p>

        <div>
          <label className="text-outer_space-500 dark:text-platinum-500 mb-2 block text-sm font-medium">
            Task Detail
          </label>
          <Controller
            control={control}
            name="detail"
            render={({ field: { onChange, value } }) => (
              <MarkdownEditor
                value={value ?? ''}
                onValueChange={onChange}
                placeholder="Enter task detail in markdown"
              />
            )}
          />
          <p className="mt-2 text-sm text-red-400">{errors.root?.message}</p>
          <p className="mt-2 text-sm text-red-400">{errors.description?.message}</p>
        </div>

        {/* TODO add task assignees */}
        <div>
          <label className="mb-2 block text-sm font-medium">Task Labels</label>
          <div className="flex flex-col gap-2">
            <Controller
              name="labels"
              control={control}
              render={({ field }) => (
                <AddLabelMultiSelect
                  value={field.value || []}
                  onChange={field.onChange}
                  fetchFunction={fetchProjectLabels}
                />
              )}
            />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Task Assignees</label>
          <div className="flex flex-col gap-2">
            <Controller
              name="assignees"
              control={control}
              render={({ field }) => (
                <AddUserMultiSelect
                  value={field.value || []}
                  onChange={field.onChange}
                  fetchFunction={fetchProjectMembers}
                />
              )}
            />
          </div>
        </div>
        {/* Server validation error messages */}
        <div className="my-4">
          {state?.success === false && (
            <ErrorBox key={`error-${errorCount}`} message={state.error} />
          )}
        </div>

        <div className="z-1 flex justify-end space-x-3 border-red-500 pt-4">
          <DialogClose asChild>
            <Button type="button" disabled={isPending} variant={'cancel'}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            disabled={isPending}
            className={`${isPending ? 'cursor-progress' : 'cursor-pointer'}`}
          >
            {isPending ? 'Creating' : `Create Task`}
          </Button>
        </div>
      </form>
    </>
  );
}
