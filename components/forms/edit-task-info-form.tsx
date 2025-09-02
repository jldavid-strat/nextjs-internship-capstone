import { updateTaskInfo } from '@/actions/task.actions';
import { startTransition, useActionState, useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { EditFormTaskSchema, EditFormTaskType } from '@/lib/validations/task.validations';
import { zodResolver } from '@hookform/resolvers/zod';
import { TASK_PRIORITY_VALUES } from '@/lib/db/schema/enums';
import { Input } from '../ui/input';
import MarkdownEditor from '../markdown/markdown-editor';
import { Button } from '../ui/button';
import { capitalize } from 'lodash';
import { ErrorBox } from '../ui/error-box';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { useQueryClient } from '@tanstack/react-query';
import { TaskCardData } from '@/types/types';
import { Project, Task } from '@/types/db.types';
import SubHeader from '../ui/subheader';
import { BookOpenText, Edit } from 'lucide-react';
import { useSheetStore } from '@/stores/modal-store';

export type EditTaskInfoFormProps = {
  kanbanData: {
    projectId: Project['id'];
    taskId: Task['id'];
    statusList: string[];
  };
  taskInfoData: EditFormTaskType;
};

export default function EditTaskInfoForm({ kanbanData, taskInfoData }: EditTaskInfoFormProps) {
  const { taskId, projectId, statusList } = kanbanData;
  const [state, updateTaskInfoAction, isPending] = useActionState(
    updateTaskInfo.bind(null, { taskId: taskId, projectId: projectId }),
    undefined,
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EditFormTaskType>({
    mode: 'onBlur',
    resolver: zodResolver(EditFormTaskSchema),
    defaultValues: {
      ...taskInfoData,
      startDate:
        taskInfoData.startDate && new Date(taskInfoData.startDate!).toISOString().split('T')[0],
      dueDate: taskInfoData.dueDate && new Date(taskInfoData.dueDate!).toISOString().split('T')[0],
    },
  });

  const formRef = useRef(null);
  const [errorCount, setErrorCount] = useState(0);

  const onSubmitHandler = (data: EditFormTaskType) => {
    const formData = new FormData(formRef.current!);

    formData.append('detail', data.detail as string);

    startTransition(() => updateTaskInfoAction(formData));
  };

  const handleCancel = () => {
    // reset the form field to previous values
    reset();
    setIsEditing(false);
  };

  useEffect(() => {
    if (state?.success === false && state?.error) {
      //   always increment on unsuccesful attempt
      setErrorCount((prev) => prev + 1);
    }
    if (state?.success === true) {
      console.log('succesful added');
      //   toast
    }
  }, [state, close]);

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
      <section className="p-4">
        <section className="mb-4 flex flex-row justify-between">
          <SubHeader
            title={'Task Info'}
            description={'General information about the project'}
            icon={<BookOpenText size={20} />}
            color="text-primary"
          />
          <Button
            type="button"
            onClick={() => {
              setIsEditing((prev) => !prev);
            }}
          >
            <Edit className="hover:text-accent" />
          </Button>
        </section>
        <div>
          <label className="text-outer_space-500 dark:text-platinum-500 mb-2 block text-sm font-medium">
            Task Title
          </label>
          <textarea
            {...register('title')}
            readOnly={!isEditing}
            name="title"
            rows={2}
            className="focus:ring-visible border-border bg-input/30 w-full rounded-lg border px-3 py-2 text-sm focus:outline-hidden"
            placeholder="Concisely describe what the task is about"
          />
          <p className="mt-2 text-sm text-red-400">{errors.title?.message}</p>
        </div>
        <div>
          <label className="text-outer_space-500 dark:text-platinum-500 mb-2 block text-sm font-medium">
            Description
          </label>
          <textarea
            {...register('description')}
            readOnly={!isEditing}
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
              readOnly={!isEditing}
            />
          </div>
          <div className="items-center gap-2">
            <label className="mb-2 block text-sm font-medium">Status</label>
            <select
              {...register('status')}
              name="status"
              className="bg-card border-border h-8 w-[180px] rounded-lg border px-2 focus:outline-hidden focus-visible:ring"
              disabled={!isEditing}
            >
              {statusList.map((status, index) => (
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
              readOnly={!isEditing}
            />
          </div>
          <div className="items-center gap-2">
            <label className="mb-2 block text-sm font-medium">Priority</label>
            <select
              {...register('priority')}
              name="priority"
              className="bg-card border-border h-8 w-[180px] rounded-lg border px-2 focus:outline-hidden focus-visible:ring"
              disabled={!isEditing}
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
          {isEditing ? (
            <>
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
            </>
          ) : (
            <MarkdownPreview source={taskInfoData.detail?.trim() || '*No task detail*'} />
          )}
          <p className="mt-2 text-sm text-red-400">{errors.detail?.message}</p>
        </div>
        <p className="mt-2 text-sm text-red-400">{errors.root?.message}</p>
        <div className="my-4">
          {state?.success === false && (
            <ErrorBox key={`error-${errorCount}`} message={state.error} />
          )}
        </div>
      </section>

      {isEditing && (
        <div className="bg-card border-accent sticky right-0 bottom-0 left-0 flex w-full justify-end gap-2 rounded-t-md border-t-1 p-4">
          <Button
            type="button"
            disabled={isPending}
            variant="cancel"
            onClick={() => {
              handleCancel();
              setIsEditing(false);
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className={isPending ? 'cursor-progress' : 'cursor-pointer'}
          >
            {isPending ? 'Saving...' : 'Update Task Info'}
          </Button>
        </div>
      )}
    </form>
  );
}
