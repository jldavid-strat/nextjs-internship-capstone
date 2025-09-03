'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Pencil } from 'lucide-react';
import { ErrorBox } from '../ui/error-box';
import {
  FormKanbanColumnSchemaType,
  FormKanbanColumnSchema,
} from '@/lib/validations/kanban-column.validations';
import { updateKanbanColumn } from '@/actions/kanban_column.actions';
import { useQueryClient } from '@tanstack/react-query';
import { EditKanbaColumnFormData } from '@/types/types';
import Modal from '../ui/modal';
import { toast } from 'sonner';

type EditKanbanColumnFormProps = {
  isEditOpen: boolean;
  setIsEditOpen: Dispatch<SetStateAction<boolean>>;
  kanbanData: EditKanbaColumnFormData;
};

export default function EditKanbanColumnForm({
  isEditOpen,
  setIsEditOpen,
  kanbanData,
}: EditKanbanColumnFormProps) {
  const { projectId, name, description, projectColumnId, kanbanColumnId } = kanbanData;
  const [state, updateKanbanColumnAction, isPending] = useActionState(
    updateKanbanColumn.bind(null, projectId, projectColumnId, kanbanColumnId),
    undefined,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormKanbanColumnSchemaType>({
    mode: 'onBlur',
    resolver: zodResolver(FormKanbanColumnSchema),
    defaultValues: {
      name: name,
      description: description ?? '',
    },
  });

  const [errorCount, setErrorCount] = useState<number>(0);

  const _queryClient = useQueryClient();

  const formRef = useRef(null);

  const onSubmitHandler = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    handleSubmit(() => {
      //   console.log(new FormData(formRef.current!));
      startTransition(() => updateKanbanColumnAction(new FormData(formRef.current!)));
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
      setIsEditOpen(false);
      toast.success('Succesfully updated the kanban column');
    }
  }, [state, _queryClient, projectId, setIsEditOpen]);

  return (
    <>
      <Modal className="w-[500px]" isOpen={isEditOpen} setIsOpen={setIsEditOpen}>
        <div className="space-y-4">
          <form ref={formRef} onSubmit={onSubmitHandler}>
            <header className="mb-4 flex flex-row items-center gap-2">
              <Pencil size={20} className="text-primary" />
              <h2 className="text-primary text-md">Edit Kanban Column</h2>
            </header>
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium">Kanban Name *</label>
              {/* TODO: add way to auto-focus title input */}
              <Input
                {...register('name')}
                type="text"
                name="name"
                placeholder="Enter kanban name"
              />
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
                onClick={() => setIsEditOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant={'default'}
                className={`${isPending ? 'cursor-progress' : 'cursor-pointer'}`}
              >
                {isPending ? 'Saving' : `Edit Column`}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
