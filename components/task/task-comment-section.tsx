'use client';

import { Project, Task, TaskComment } from '@/types/db.types';
import { startTransition, useActionState, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import MarkdownEditor from '../markdown/markdown-editor';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  FormTaskCommentSchema,
  FormTaskCommentSchemaType,
} from '@/lib/validations/task.validations';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import SubHeader from '../ui/subheader';
import { BookOpenText, PencilLine, Loader2 } from 'lucide-react';
import { formatDate } from '../../lib/utils/format_date';
import { ErrorBox } from '../ui/error-box';
import { addTaskComment, updateTaskComment } from '@/actions/task_comment.actions';
import { useQueryClient } from '@tanstack/react-query';
import { useTaskComments } from '@/hooks/use-task-comments';
import MarkdownPreview from '@uiw/react-markdown-preview';
import TaskCommentDropdown from '../dropdowns/task-comment-dropdown';
import { toast } from 'sonner';

export default function TaskCommentSection({
  taskId,
  projectId,
}: {
  taskId: Task['id'];
  projectId: Project['id'];
}) {
  const [state, addTaskCommentAction, isPending] = useActionState(
    addTaskComment.bind(null, taskId, projectId),
    null,
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormTaskCommentSchemaType>({
    resolver: zodResolver(FormTaskCommentSchema),
  });

  const { isTaskCommentLoading, taskComments } = useTaskComments(taskId);

  const [isCommenting, setIsCommenting] = useState<boolean>(false);

  //   state variable to only open the correct task comment
  const [editKey, setIsEditKey] = useState<number | null>(null);
  const [errorCount, setErrorCount] = useState<number>(0);
  const _queryClient = useQueryClient();

  const onSubmitHandler = (data: FormTaskCommentSchemaType) => {
    const formData = new FormData();

    formData.append('content', data.content);

    startTransition(() => addTaskCommentAction(formData));
  };

  useEffect(() => {
    if (state?.success === false && state?.error) {
      //   always increment on unsuccesful attempt
      setErrorCount((prev) => prev + 1);
    }
    if (state?.success === true) {
      // refresh task comment list query
      _queryClient.invalidateQueries({
        queryKey: ['task-comments', taskId],
      });

      setIsCommenting(false);
      toast.success('Successfully added a new comment');

      //   toast
    }
  }, [state, _queryClient, taskId]);

  if (isTaskCommentLoading) return <TaskCommentLoading />;

  return (
    <section className="space-y-4 p-4">
      <section className="mb-2 flex flex-row justify-between">
        <SubHeader
          title={'Task Comments'}
          description={'View comments of other members about the task'}
          icon={<BookOpenText size={20} />}
          color="text-primary"
        />
        <Button
          type="button"
          onClick={() => {
            setIsCommenting((prev) => !prev);
          }}
          disabled={isPending}
        >
          <PencilLine className="hover:text-accent" />
        </Button>
      </section>

      {/* Comment input box */}
      {isCommenting && (
        <>
          <form onSubmit={handleSubmit(onSubmitHandler)} className="flex flex-col gap-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Submit a comment</label>
              <Controller
                control={control}
                name="content"
                render={({ field: { onChange, value } }) => (
                  <MarkdownEditor
                    value={value ?? ''}
                    onValueChange={onChange}
                    placeholder="Enter task comment in markdown"
                  />
                )}
              />
              <p className="mt-2 text-sm text-red-400">{errors.content?.message}</p>
            </div>

            {state?.success === false && (
              <div className="my-4">
                <ErrorBox key={`error-${errorCount}`} message={state.error} />
              </div>
            )}
            <Button className="flex w-fit justify-end" type="submit" disabled={isPending}>
              {isPending ? `Commenting` : 'Comment'}
            </Button>
          </form>
        </>
      )}

      {/* Comments list */}
      <div className="space-y-3">
        {taskComments.length === 0 && (
          <p className="text-muted-foreground text-sm">No comments yet.</p>
        )}

        {taskComments.map((comment) => (
          <Card key={comment.taskCommentId} className="shadow-sm">
            <CardContent className="p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-primary w-[300px] truncate font-medium">{`${comment.firstName} ${comment.lastName}`}</span>
                  <span className="text-muted-foreground w-[300px] truncate text-xs underline underline-offset-0 hover:underline">{`${comment.primaryEmailAdress}`}</span>
                  <span className="text-muted-foreground text-xs">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <TaskCommentDropdown
                  key={comment.authorId}
                  taskCommentData={{
                    authorId: comment.authorId,
                    content: comment.content,
                    taskId: taskId,
                    taskCommentId: comment.taskCommentId,
                    setIsEditing: setIsEditKey,
                  }}
                />
              </div>
              {editKey ? (
                <EditTaskContentForm
                  taskCommentId={comment.taskCommentId}
                  taskId={taskId}
                  projectId={projectId}
                  content={comment.content}
                  editKey={editKey}
                  setIsEditKey={setIsEditKey}
                />
              ) : (
                editKey !== comment.taskCommentId && (
                  <MarkdownPreview
                    source={comment.content || '*No task comment content*'}
                    style={{
                      backgroundColor: 'transparent',
                      color: 'inherit',
                    }}
                  />
                )
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

type EditTaskContentFormProps = {
  taskCommentId: TaskComment['id'];
  projectId: Project['id'];
  content: TaskComment['content'];
  taskId: Task['id'];
  editKey: TaskComment['id'];
  setIsEditKey: (key: number | null) => void;
};

function EditTaskContentForm({
  taskCommentId,
  projectId,
  content,
  taskId,
  editKey,
  setIsEditKey,
}: EditTaskContentFormProps) {
  const [state, updateTaskCommentAction, isPending] = useActionState(
    updateTaskComment.bind(null, taskId, taskCommentId, projectId),
    null,
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormTaskCommentSchemaType>({
    resolver: zodResolver(FormTaskCommentSchema),
    defaultValues: {
      content: content,
    },
  });

  const [errorCount, setErrorCount] = useState<number>(0);
  const _queryClient = useQueryClient();

  const onSubmitHandler = (data: FormTaskCommentSchemaType) => {
    const formData = new FormData();

    formData.append('content', data.content);

    startTransition(() => updateTaskCommentAction(formData));
  };

  useEffect(() => {
    if (state?.success === false && state?.error) {
      //   always increment on unsuccesful attempt
      setErrorCount((prev) => prev + 1);
    }
    if (state?.success === true) {
      // refresh task comment list query
      _queryClient.invalidateQueries({
        queryKey: ['task-comments', taskId],
      });
      setIsEditKey(null);
      toast.success('Successfully edited the task comment');
    }
  }, [state, _queryClient, taskId, setIsEditKey]);

  if (editKey !== taskCommentId) return;

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="flex flex-col gap-2">
      <div>
        <Controller
          control={control}
          name="content"
          render={({ field: { onChange, value } }) => (
            <MarkdownEditor
              value={value ?? ''}
              onValueChange={onChange}
              placeholder="Enter task comment in markdown"
            />
          )}
        />
        <p className="mt-2 text-sm text-red-400">{errors.content?.message}</p>
      </div>

      {state?.success === false && (
        <div className="my-4">
          <ErrorBox key={`error-${errorCount}`} message={state.error} />
        </div>
      )}
      <div className="flex w-full justify-end gap-2">
        <Button
          variant="cancel"
          type="button"
          disabled={isPending}
          onClick={() => {
            setIsEditKey(null);
            reset();
          }}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? `Saving` : 'Save'}
        </Button>
      </div>
    </form>
  );
}

function TaskCommentLoading() {
  return (
    <div className="flex items-center gap-2 p-4">
      <Loader2 className="animate-spin" size={12} />
      <span className="text-muted-foreground">Loading task comments</span>
    </div>
  );
}
