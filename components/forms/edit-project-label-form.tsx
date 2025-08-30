'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { startTransition, useActionState, useEffect, useRef, useState } from 'react';
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
import { Label, Project, ProjectLabel } from '@/types/db.types';
import { updateProjectLabel } from '@/actions/project_labels.actions';

export type EditProjectLabelFormProps = {
  name: Label['name'];
  color: ProjectLabel['color'];
  labelId: Label['id'];
  projectId: Project['id'];
};

export default function EditProjectLabelForm({
  projectLabelData,
}: {
  projectLabelData: EditProjectLabelFormProps;
}) {
  const [state, updateProjectLabelAction, isPending] = useActionState(
    updateProjectLabel.bind(null, {
      projectId: projectLabelData.projectId,
      labelId: projectLabelData.labelId,
    }),
    undefined,
  );

  const [errorCount, setErrorCount] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProjectLabelType>({
    mode: 'onBlur',
    resolver: zodResolver(ProjectLabelSchema),
    defaultValues: {
      name: projectLabelData.name,
      color: projectLabelData.color ?? DEFAULT_COLOR,
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
      startTransition(() => updateProjectLabelAction(new FormData(formRef.current!)));
    })(evt);
  };

  useEffect(() => {
    if (state?.success === false && state?.error) {
      //   always increment on unsuccesful attempt
      setErrorCount((prev) => prev + 1);
    }
    if (state?.success === true) {
      console.log('succesful edit');
      //   toast
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
          {state?.success === false && (
            <ErrorBox
              // need key to make the error box visible again in next form submission
              key={`error-${errorCount}`}
              message={state.error!}
            />
          )}
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
            {isPending ? 'Saving' : `Update Label`}
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
