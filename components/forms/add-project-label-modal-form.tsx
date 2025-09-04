'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { startTransition, useActionState, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { ErrorBox } from '../ui/error-box';
import {
  DEFAULT_COLOR,
  ProjectLabelSchema,
  ProjectLabelType,
} from '@/lib/validations/project-label.validations';
import { Project } from '@/types/db.types';
import { addProjectLabel } from '@/actions/project_labels.actions';
import Modal from '../ui/modal';
import { cn } from '@/lib/utils/shadcn-utils';
import { toast } from 'sonner';

export default function AddProjectLabelForm({ projectId }: { projectId: Project['id'] }) {
  const [state, addProjectLabelAction, isPending] = useActionState(
    addProjectLabel.bind(null, projectId),
    undefined,
  );

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProjectLabelType>({
    resolver: zodResolver(ProjectLabelSchema),
    defaultValues: {
      color: DEFAULT_COLOR,
    },
  });

  const [errorCount, setErrorCount] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const labelName = watch('name');
  const labelColor = watch('color');

  const formRef = useRef(null);

  const onSubmitHandler = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    handleSubmit(() => {
      // console.log(new FormData(formRef.current!));
      startTransition(() => addProjectLabelAction(new FormData(formRef.current!)));
    })(evt);
  };

  useEffect(() => {
    if (state?.success === false && state?.error) {
      //   always increment on unsuccesful attempt
      setErrorCount((prev) => prev + 1);
    }
    if (state?.success === true) {
      toast.success('Succesfully added a new project label');
      reset();
      setIsModalOpen(false);
      //   toast
    }
  }, [state, reset]);

  return (
    <Modal
      isOpen={isModalOpen}
      setIsOpen={(isModalOpen) => {
        setIsModalOpen(isModalOpen);
        if (!isModalOpen) {
          // clears the form when dialog closes
          reset();
        }
      }}
      className="w-[500px]"
      triggerComponent={
        <Button type="button">
          <Plus size={12} />
        </Button>
      }
    >
      <div className="space-y-4">
        <form ref={formRef} onSubmit={onSubmitHandler}>
          <header className="mb-4 flex flex-row items-center gap-2">
            <Plus size={20} className="text-primary" />
            <h2 className="text-primary text-md">Add Project Label</h2>
          </header>
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium">Project Title *</label>
            {/* TODO: add way to auto-focus title input */}
            <Input {...register('name')} type="text" name="name" placeholder="Enter project name" />
            <p className="mt-2 text-sm text-red-400">{errors.name?.message}</p>
          </div>
          <div className="mb-2 flex flex-row items-center gap-2">
            <label className="text-sm font-medium">Label Color</label>
            <Input
              {...register('color')}
              type="color"
              name="color"
              className="w-[100px] bg-transparent"
            />
            <p className="mt-2 text-sm text-red-400">{errors.color?.message}</p>
          </div>
          {/* Label Preview */}
          <LabelPreview color={labelColor} name={labelName} />
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
              {isPending ? 'Adding' : `Add Label`}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

type LabelPreviewProps = {
  name: string;
  color: string;
  className?: string;
};

export function LabelPreview({ name, color, className = '' }: LabelPreviewProps) {
  if (!name) return null;

  return (
    <div
      className={cn(
        `mt-4 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium`,
        className,
      )}
      style={{
        backgroundColor: 'transparent',
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      <span className="max-w-[400px] truncate">{name}</span>
    </div>
  );
}
