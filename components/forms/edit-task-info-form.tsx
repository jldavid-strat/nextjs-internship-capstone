import { updateTaskInfo } from '@/actions/task.actions';
import { startTransition, useActionState, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FormTaskSchema, FormTaskSchemaType } from '@/lib/validations/task.validations';
import { zodResolver } from '@hookform/resolvers/zod';
import { TASK_PRIORITY_VALUES } from '@/lib/db/schema/enums';
import { Input } from '../ui/input';
import MarkdownEditor from '../markdown/markdown-editor';
import { Button } from '../ui/button';
import { ErrorBox } from '../ui/error-box';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { useQueryClient } from '@tanstack/react-query';
import { Project, ProjectKanbanColumn, Task } from '@/types/db.types';
import SubHeader from '../ui/subheader';
import { BookOpenText, Edit } from 'lucide-react';
import { EditTaskCardData } from '@/types/types';
import { AddLabelMultiSelect } from '../ui/add-label-multi-select';
import { LabelPreview } from './add-project-label-modal-form';
import { DEFAULT_COLOR } from '@/lib/validations/project-label.validations';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { AddUserMultiSelect } from '../ui/add-user-multi-select';
import { useFetchMultiSelect } from '@/hooks/use-fetch-multiselect';
import { toast } from 'sonner';

export type EditTaskInfoFormProps = {
  kanbanData: {
    projectId: Project['id'];
    taskId: Task['id'];
    projectColumnId: ProjectKanbanColumn['id'];
  };
  taskInfoData: EditTaskCardData;
};

export default function EditTaskInfoForm({ kanbanData, taskInfoData }: EditTaskInfoFormProps) {
  const { taskId, projectId, projectColumnId } = kanbanData;

  const [state, updateTaskInfoAction, isPending] = useActionState(
    updateTaskInfo.bind(null, {
      taskId: taskId,
      projectId: projectId,
      projectColumnId: projectColumnId,
    }),
    undefined,
  );

  const labelIds = useMemo(() => {
    taskInfoData.labels.map((l) => l.id);
  }, [taskInfoData.labels]);

  const assigneeIds = useMemo(() => {
    taskInfoData.assignees.map((u) => u.id);
  }, [taskInfoData.assignees]);

  const [isEditing, setIsEditing] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormTaskSchemaType>({
    mode: 'onBlur',
    resolver: zodResolver(FormTaskSchema),
    defaultValues: {
      ...taskInfoData,
      labels: labelIds ?? [],
      assignees: assigneeIds ?? [],
      startDate:
        taskInfoData.startDate && new Date(taskInfoData.startDate!).toISOString().split('T')[0],
      dueDate: taskInfoData.dueDate && new Date(taskInfoData.dueDate!).toISOString().split('T')[0],
    },
  });

  const formRef = useRef(null);
  const [errorCount, setErrorCount] = useState<number>(0);
  const _queryClient = useQueryClient();

  const { fetchProjectLabels, fetchProjectMembers } = useFetchMultiSelect(kanbanData.projectId);

  const onSubmitHandler = (data: FormTaskSchemaType) => {
    const formData = new FormData(formRef.current!);

    formData.append('detail', data.detail as string);
    formData.append('labels', JSON.stringify([...(data.labels ?? [])]));
    formData.append('assignees', JSON.stringify([...(data.assignees ?? [])]));
    // console.log(formData);
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
      // refresh task list query
      _queryClient.invalidateQueries({
        queryKey: ['tasks', projectId],
      });
      setIsEditing(false);
      toast.success('Succesfully edited task detail');

      //   toast
    }
  }, [state, _queryClient, projectId]);

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
          <label className="mb-2 block text-sm font-medium">Task Title</label>
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
          <label className="mb-2 block text-sm font-medium">Description</label>
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
        <section className="my-4 flex w-full flex-row gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Start Date</label>
            <Input
              {...register('startDate', { setValueAs: (val) => (val === '' ? null : val) })}
              type="date"
              name="startDate"
              className="w-[150px]"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Due Date</label>
            <Input
              {...register('dueDate', { setValueAs: (val) => (val === '' ? null : val) })}
              type="date"
              name="dueDate"
              className="w-[150px]"
            />
          </div>
          <div className="items-center gap-2">
            <label className="mb-2 block text-sm font-medium">Priority</label>
            <select
              {...register('priority')}
              name="priority"
              className="bg-card border-border h-8.5 w-[150px] rounded-lg border px-2 capitalize focus:outline-hidden focus-visible:ring"
            >
              {TASK_PRIORITY_VALUES.map((priority, index) => (
                <option key={index} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>
        </section>
        <p className="mt-2 text-sm text-red-400">{errors.dueDate?.message}</p>
        <p className="mt-2 text-sm text-red-400">{errors.startDate?.message}</p>
        <p className="mt-2 text-sm text-red-400">{errors.priority?.message}</p>
        <div className="mt-6">
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
            <>
              <MarkdownPreview
                className="bg-accent border-input h-20 rounded-sm border-1 p-2"
                source={taskInfoData.detail?.trim() || '*No task detail*'}
                style={{
                  backgroundColor: 'transparent',
                  color: 'inherit',
                }}
              />
            </>
          )}
          <p className="mt-2 text-sm text-red-400">{errors.detail?.message}</p>
        </div>

        {/* task label multiselect */}
        <div className="mt-6 mb-2 flex flex-row items-center gap-2">
          <label className="text-sm font-medium">Task Labels</label>
          {!isEditing && (
            <div>
              {taskInfoData.labels.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {taskInfoData.labels.map((label) => (
                    <LabelPreview
                      key={label.id}
                      name={label.labelName}
                      color={label.color ?? DEFAULT_COLOR}
                      className="mt-0"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-primary text-sm italic">No Task Labels</p>
              )}
            </div>
          )}
        </div>
        {isEditing && (
          <div className="flex flex-col gap-2">
            <Controller
              name="labels"
              control={control}
              render={({ field }) => (
                <AddLabelMultiSelect
                  value={field.value || []}
                  onChange={field.onChange}
                  fetchFunction={fetchProjectLabels}
                  defaultValues={taskInfoData.labels}
                />
              )}
            />
          </div>
        )}

        <p className="mt-2 text-sm text-red-400">{errors.labels?.message}</p>

        <div className="mt-6 mb-2 flex flex-row items-center gap-2">
          <label className="text-sm font-medium">Task Assigness</label>
          {!isEditing && (
            <div>
              {taskInfoData.assignees.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {taskInfoData.assignees.map((user, index) => (
                    <Badge
                      key={`${user.id}-${index}`}
                      variant="secondary"
                      className="flex items-center gap-1 pr-1"
                    >
                      {user.imgLink && (
                        <Avatar className="h-4 w-4">
                          <AvatarImage
                            src={user.imgLink}
                            alt={`${user.firstName} ${user.lastName}`}
                          />
                          <AvatarFallback>
                            {user.firstName.charAt(0)}
                            {user.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <span className="max-w-[100px] truncate text-xs">
                        {user.primaryEmailAddress}
                      </span>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-primary text-sm italic">Task is not assigned</p>
              )}
            </div>
          )}
        </div>

        {/* task assignee multiselect  */}
        {isEditing && (
          <>
            <div className="flex flex-col gap-2">
              <Controller
                name="assignees"
                control={control}
                render={({ field }) => (
                  <AddUserMultiSelect
                    value={field.value || []}
                    onChange={field.onChange}
                    fetchFunction={fetchProjectMembers}
                    defaultValues={taskInfoData.assignees}
                  />
                )}
              />
            </div>
            <p className="mt-2 text-sm text-red-400">{errors.assignees?.message}</p>
          </>
        )}

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
