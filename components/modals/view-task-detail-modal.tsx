'use client';

import { updateTask } from '@/lib/queries/task.queries';
import { X } from 'lucide-react';
import { startTransition, useActionState, useLayoutEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { TaskSchema } from '@/lib/validations';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { TASK_PRIORITY_VALUES } from '@/lib/db/schema/enums';
import { Task } from '@/types/db.types';

// TODO add ability to add labels
// TODO add way to assign a member
const FormTaskSchema = TaskSchema.pick({
  title: true,
  description: true,
  detail: true,
  priority: true,
  startDate: true,
  dueDate: true,
});
type FormTaskType = z.input<typeof FormTaskSchema>;

type ViewTaskProps = Pick<
  Task,
  'id' | 'projectId' | 'title' | 'description' | 'detail' | 'priority' | 'startDate' | 'dueDate'
>;

export function ViewTaskDetailModal({
  taskData,
  setIsOpen,
}: {
  taskData: ViewTaskProps;
  setIsOpen: (setValue: boolean) => void;
}) {
  const [state, updateTaskAction, isPending] = useActionState(
    updateTask.bind(null, { taskId: taskData.id, projectId: taskData.projectId }),
    undefined,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormTaskType>({
    resolver: zodResolver(FormTaskSchema),
    defaultValues: {
      title: taskData.title,
      description: taskData.description,
      detail: taskData.detail,
      priority: taskData.priority,
      startDate: taskData.startDate && new Date(taskData.startDate!).toISOString().split('T')[0],
      dueDate: taskData.dueDate && new Date(taskData.dueDate!).toISOString().split('T')[0],
    },
  });

  const formRef = useRef(null);
  const router = useRouter();

  const onSubmitHandler = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    handleSubmit(() => {
      // console.log(new FormData(formRef.current!));
      startTransition(() => updateTaskAction(new FormData(formRef.current!)));
    })(evt);
  };

  // NOTE only handle success state
  useLayoutEffect(() => {
    if (state?.success) {
      setIsOpen(false);
      alert('Successfully created task');

      // redirect to newly project page
      // router.push(`/projects/${state.data}`);
    }
  }, [state, router, setIsOpen]);

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="dark:bg-outer_space-500 mx-4 w-full max-w-md overflow-scroll rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-outer_space-500 dark:text-platinum-500 text-lg font-semibold">
            View/Edit Task Detail
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded p-1"
          >
            <X size={20} />
          </button>
        </div>

        <form ref={formRef} onSubmit={onSubmitHandler} className="space-y-4">
          <div>
            <label className="text-outer_space-500 dark:text-platinum-500 mb-2 block text-sm font-medium">
              Task Title *
            </label>

            {/* TODO: add way to auto-focus title input */}
            <input
              {...register('title')}
              type="text"
              name="title"
              className="border-french_gray-300 dark:border-payne's_gray-400 dark:bg-outer_space-400 text-outer_space-500 dark:text-platinum-500 focus:ring-blue_munsell-500 w-full rounded-lg border bg-white px-3 py-2 focus:ring-2 focus:outline-hidden"
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
              className="border-french_gray-300 dark:border-payne's_gray-400 dark:bg-outer_space-400 text-outer_space-500 dark:text-platinum-500 focus:ring-blue_munsell-500 w-full rounded-lg border bg-white px-3 py-2 focus:ring-2 focus:outline-hidden"
              placeholder="Concisely describe what the task is about"
            />
            <p className="mt-2 text-sm text-red-400">{errors.description?.message}</p>
          </div>

          {/* TOOD: make this a rich text editor */}
          <div>
            <label className="text-outer_space-500 dark:text-platinum-500 mb-2 block text-sm font-medium">
              Task Detail
            </label>
            <textarea
              {...register('detail')}
              name="detail"
              rows={3}
              className="border-french_gray-300 dark:border-payne's_gray-400 dark:bg-outer_space-400 text-outer_space-500 dark:text-platinum-500 focus:ring-blue_munsell-500 w-full rounded-lg border bg-white px-3 py-2 focus:ring-2 focus:outline-hidden"
              placeholder="More information about the task"
            />
            <p className="mt-2 text-sm text-red-400">{errors.description?.message}</p>
          </div>
          <div>
            <label className="text-outer_space-500 dark:text-platinum-500 mb-2 block text-sm font-medium">
              Start Date
            </label>
            <input
              {...register('startDate', { setValueAs: (val) => (val === '' ? null : val) })}
              type="date"
              name="startDate"
              className="border-french_gray-300 dark:border-payne's_gray-400 dark:bg-outer_space-400 text-outer_space-500 dark:text-platinum-500 focus:ring-blue_munsell-500 w-full rounded-lg border bg-white px-3 py-2 focus:ring-2 focus:outline-hidden"
            />
            <p className="mt-2 text-sm text-red-400">{errors.startDate?.message}</p>
          </div>

          <div>
            <label className="text-outer_space-500 dark:text-platinum-500 mb-2 block text-sm font-medium">
              Due Date
            </label>
            <input
              {...register('dueDate', { setValueAs: (val) => (val === '' ? null : val) })}
              type="date"
              name="dueDate"
              className="border-french_gray-300 dark:border-payne's_gray-400 dark:bg-outer_space-400 text-outer_space-500 dark:text-platinum-500 focus:ring-blue_munsell-500 w-full rounded-lg border bg-white px-3 py-2 focus:ring-2 focus:outline-hidden"
            />
            <p className="mt-2 text-sm text-red-400">{errors.dueDate?.message}</p>
          </div>

          <div className="flex w-full flex-row justify-between">
            <label className="text-outer_space-500 dark:text-platinum-500 mb-2 block text-sm font-medium">
              Priority
            </label>
            <select
              {...register('priority')}
              name="priority"
              className="border-french_gray-300 dark:border-payne's_gray-400 dark:bg-outer_space-400 text-outer_space-500 dark:text-platinum-500 focus:ring-blue_munsell-500 rounded-lg border bg-white px-3 py-2 focus:ring-2 focus:outline-hidden"
            >
              {TASK_PRIORITY_VALUES.map((priority, index) => (
                <option key={index} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>

          {/* TODO add assignees */}
          <div>
            <p className="text-outer_space-500 dark:text-platinum-500 mb-2 block text-sm font-medium">
              Add assignees:
            </p>
          </div>

          {/* Server validation error messages */}
          {/* TODO display all error messages not just one */}
          <div>
            {!errors && `CLIENT: ${JSON.stringify(errors, null, 2)}`}
            {state?.success === false && (
              <p className="mt-2 text-sm text-red-400">{`SERVER: ${state?.message}`}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              disabled={isPending}
              onClick={() => setIsOpen(false)}
              className="text-payne's_gray-500 dark:text-french_gray-400 hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded-lg px-4 py-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={`bg-blue_munsell-500 hover:bg-blue_munsell-600 rounded-lg px-4 py-2 text-white transition-colors ${isPending ? 'cursor-progress' : 'cursor-pointer'}`}
            >
              {isPending ? 'Saving' : `Edit Task`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
