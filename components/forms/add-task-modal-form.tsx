'use client';

import { createTask } from '@/actions/task.actions';
import { startTransition, useActionState, useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FormTaskSchema, FormTaskSchemaType } from '@/lib/validations/task.validations';
import { zodResolver } from '@hookform/resolvers/zod';
import { TASK_PRIORITY_VALUES } from '@/lib/db/schema/enums';
import { Input } from '../ui/input';
import MarkdownEditor from '../markdown/markdown-editor';
import { Button } from '../ui/button';
import { capitalize } from 'lodash';
import { ErrorBox } from '../ui/error-box';
import { AddLabelMultiSelect } from '../ui/add-label-multi-select';
import { ProjectKanbanColumn } from '@/types/db.types';
import { AddUserMultiSelect } from '../ui/add-user-multi-select';
import { FilePlus2, Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import Modal from '../ui/modal';
import { Badge } from '../ui/badge';
import { useFetchMultiSelect } from '../../hooks/use-fetch-multiselect';

// Integration:
// - Use task validation schema
// - Call task creation/update API
// - Update board state optimistically
// - Handle file uploads
// - Real-time updates for comments
// */

// TODO add toast promise to UNDO mutation via drizzle transaction

export type CreateTaskProps = {
  projectColumnId: ProjectKanbanColumn['id'];
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
    reset,
    formState: { errors },
  } = useForm<FormTaskSchemaType>({
    resolver: zodResolver(FormTaskSchema),
    defaultValues: {
      priority: 'none',
      status: kanbanData.kanbanName,
      detail: '',
      labels: [],
      assignees: [],
    },
  });

  const _queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [errorCount, setErrorCount] = useState<number>(0);
  const { fetchProjectLabels, fetchProjectMembers } = useFetchMultiSelect(kanbanData.projectId);

  const formRef = useRef(null);

  const onSubmitHandler = (data: FormTaskSchemaType) => {
    const formData = new FormData(formRef.current!);

    formData.append('detail', data.detail ?? '');
    formData.append('labels', JSON.stringify([...(data.labels ?? [])]));
    formData.append('assignees', JSON.stringify([...(data.assignees ?? [])]));

    startTransition(() => createTaskAction(formData));
  };

  useEffect(() => {
    if (state?.success === false && state?.error) {
      //   always increment on unsuccesful attempt
      setErrorCount((prev) => prev + 1);
    }
    if (state?.success === true) {
      _queryClient.invalidateQueries({
        queryKey: ['tasks', kanbanData.projectId],
      });
      reset();
      setIsModalOpen(false);
      console.log('succesful added');
      //   toast
    }
  }, [state, _queryClient, kanbanData.projectId, reset]);

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        setIsOpen={(isModalOpen) => {
          setIsModalOpen(isModalOpen);
          if (!isModalOpen) {
            // disable scroll lock due to overflow auto

            document.body.style.overflow = '';
            // clears the form when dialog closes
            reset();
          }
        }}
        className="max-h-[700px] overflow-x-hidden p-0 sm:max-w-[600px] lg:max-w-[700px]"
        triggerComponent={
          <Button variant={'outline'} className="border-0 bg-transparent dark:bg-transparent">
            <Plus size={12} />
          </Button>
        }
      >
        <header className="px-6 pt-6">
          <div className="flex items-center gap-4">
            <FilePlus2 size={20} className="text-primary" />
            <h3 className="text-primary text-lg font-medium">Create New Task</h3>
            <Badge variant={'outline'} className="text-primary/50 capitalize">
              {kanbanData.kanbanName}
            </Badge>
          </div>
        </header>
        <form ref={formRef} onSubmit={handleSubmit(onSubmitHandler)} className="">
          <section className="px-6">
            <div>
              <label className="mb-2 block text-sm font-medium">Task Title *</label>
              {/* TODO: add way to auto-focus title input */}
              <Input
                {...register('title')}
                type="text"
                name="title"
                placeholder="Enter task title"
              />
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
            <section className="my-2 flex w-full flex-row gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Start Date</label>
                <Input
                  {...register('startDate', { setValueAs: (val) => (val === '' ? null : val) })}
                  type="date"
                  name="startDate"
                  className="w-[170px]"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Due Date</label>
                <Input
                  {...register('dueDate', { setValueAs: (val) => (val === '' ? null : val) })}
                  type="date"
                  name="dueDate"
                  className="w-[170px]"
                />
              </div>
              <div className="items-center gap-2">
                <label className="mb-2 block text-sm font-medium">Priority</label>
                <select
                  {...register('priority')}
                  name="priority"
                  className="bg-card border-border h-8.5 w-[180px] rounded-lg border px-2 focus:outline-hidden focus-visible:ring"
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
              <label className="mb-2 block text-sm font-medium">Task Detail</label>
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
              <p className="mt-2 text-sm text-red-400">{errors.description?.message}</p>
            </div>
            {/* task label multiselect */}
            <div className="mt-2">
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
            {/* task assignee multiselect  */}
            <div className="mt-2">
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
          </section>

          <div className="bg-card border-accent sticky right-0 bottom-0 left-0 flex w-full justify-end gap-2 rounded-t-md border-t-1 p-4">
            <Button
              type="button"
              disabled={isPending}
              variant={'cancel'}
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className={`${isPending ? 'cursor-progress' : 'cursor-pointer'}`}
            >
              {isPending ? 'Creating' : `Create Task`}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
