'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { startTransition, useActionState, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { ErrorBox } from '../ui/error-box';
import { Project } from '@/types/db.types';
import {
  FormKanbanColumnSchemaType,
  FormKanbanColumnSchema,
} from '@/lib/validations/kanban-column.validations';
import { addKanbanColumn } from '@/actions/kanban_column.actions';
import { useQueryClient } from '@tanstack/react-query';
import Modal from '../ui/modal';
import { toast } from 'sonner';

export default function AddKanbaColumnForm({ projectId }: { projectId: Project['id'] }) {
  const [state, addKanbanColumnAction, isPending] = useActionState(
    addKanbanColumn.bind(null, projectId),
    undefined,
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormKanbanColumnSchemaType>({
    resolver: zodResolver(FormKanbanColumnSchema),
  });

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [errorCount, setErrorCount] = useState<number>(0);

  const _queryClient = useQueryClient();

  const formRef = useRef(null);

  const onSubmitHandler = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    handleSubmit(() => {
      //   console.log(new FormData(formRef.current!));
      startTransition(() => addKanbanColumnAction(new FormData(formRef.current!)));
    })(evt);
  };

  useEffect(() => {
    if (state?.success === false && state?.error) {
      //   always increment on unsuccesful attempt
      setErrorCount((prev) => prev + 1);
    }
    if (state?.success === true) {
      _queryClient.invalidateQueries({
        queryKey: ['kanban-columns', projectId],
      });
      reset();
      setIsModalOpen(false);
      toast.success('Succesfully added a new kanban board');
    }
  }, [state, reset, _queryClient, projectId]);

  return (
    <Modal
      className="w-[500px]"
      isOpen={isModalOpen}
      setIsOpen={(isModalOpen) => {
        setIsModalOpen(isModalOpen);
        if (!isModalOpen) {
          // clears the form when dialog closes
          reset();
        }
      }}
      triggerComponent={
        <Button type="button">
          <Plus size={12} />
          Add Column
        </Button>
      }
    >
      <div className="space-y-4">
        <form ref={formRef} onSubmit={onSubmitHandler}>
          <header className="mb-4 flex flex-row items-center gap-2">
            <Plus size={20} className="text-primary" />
            <h2 className="text-primary text-md">Add Kanban Column</h2>
          </header>
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium">Kanban Name *</label>
            {/* TODO: add way to auto-focus title input */}
            <Input {...register('name')} type="text" name="name" placeholder="Enter kanban name" />
            <p className="mt-2 text-sm text-red-400">{errors.name?.message}</p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Description</label>
            <textarea
              {...register('description')}
              name="description"
              rows={3}
              className="focus:ring-visible border-border bg-input/30 w-full rounded-lg border px-3 py-2 text-sm focus:outline-hidden"
              placeholder="Shortly describe the kanban column"
            />
            <p className="mt-2 text-sm text-red-400">{errors.description?.message}</p>
          </div>
          <p className="mt-2 text-sm text-red-400">{errors.root?.message}</p>
          {/* Server side error */}
          <div className="my-4">
            {state?.success === false && (
              <ErrorBox key={`error-${errorCount}`} message={state.error!} />
            )}
          </div>
          <div className="flex justify-end space-x-3 pt-4">
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
              variant={'default'}
              className={`${isPending ? 'cursor-progress' : 'cursor-pointer'}`}
            >
              {isPending ? 'Adding' : `Add Column`}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
