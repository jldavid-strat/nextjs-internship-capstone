'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { startTransition, useActionState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { ErrorBox } from '../ui/error-box';
import {
  DEFAULT_COLOR,
  ProjectLabelSchema,
  ProjectLabelType,
} from '@/lib/validations/project-label.validations';
import { DialogClose } from '../ui/dialog';
import { Project } from '@/types/db.types';
import { addProjectLabels } from '@/actions/project_labels.actions';

export default function AddProjectLabelForm({ projectId }: { projectId: Project['id'] }) {
  const [state, addProjectLabelAction, isPending] = useActionState(
    addProjectLabels.bind(null, projectId),
    undefined,
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProjectLabelType>({
    mode: 'onBlur',
    resolver: zodResolver(ProjectLabelSchema),
    defaultValues: {
      color: DEFAULT_COLOR,
    },
  });

  const labelName = watch('name');
  const labelColor = watch('color');

  const formRef = useRef(null);
  const router = useRouter();

  const onSubmitHandler = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    handleSubmit(() => {
      // console.log(new FormData(formRef.current!));
      startTransition(() => addProjectLabelAction(new FormData(formRef.current!)));
    })(evt);
  };

  // NOTE only handle success state
  useEffect(() => {
    if (state?.success) {
      //   toast show toas
    }
    return;
  }, [state, router]);

  return (
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
          {state?.success === false && <ErrorBox message={state.error!} />}
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <DialogClose asChild>
            <Button type="button" disabled={isPending} variant={'cancel'}>
              Cancel
            </Button>
          </DialogClose>
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
  );
}

type LabelPreviewProps = {
  name: string;
  color: string;
  className?: string;
};

function LabelPreview({ name, color, className = '' }: LabelPreviewProps) {
  if (!name) return null;

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${className}`}
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
