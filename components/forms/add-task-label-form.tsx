'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { startTransition, useActionState, useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { ErrorBox } from '../ui/error-box';
import { DialogClose } from '../ui/dialog';
import { Project } from '@/types/db.types';
import { addProjectLabel } from '@/actions/project_labels.actions';
import z from 'zod';
import { AddLabelMultiSelect } from '../ui/add-label-multi-select';
import { ProjectLabelTableData } from '../data-table/project-label-table';

const TaskLabelSchema = z.object({
  labels: z.array(z.int()),
});

type TaskLabelSchemaType = z.input<typeof TaskLabelSchema>;

export default function AddTaskLabelForm({
  projectId,
  fetchProjectLabels,
}: {
  projectId: Project['id'];
  fetchProjectLabels: (searchTerm: string) => Promise<ProjectLabelTableData[]>;
}) {
  const [state, addProjectLabelAction, isPending] = useActionState(
    addProjectLabel.bind(null, projectId),
    undefined,
  );

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TaskLabelSchemaType>({
    mode: 'onBlur',
    resolver: zodResolver(TaskLabelSchema),
    defaultValues: {
      labels: [],
    },
  });

  const [errorCount, setErrorCount] = useState(0);

  const formRef = useRef(null);
  const router = useRouter();

  const onSubmitHandler = (data: TaskLabelSchemaType) => {
    const formData = new FormData();

    formData.append('labels', JSON.stringify([...(data.labels ?? [])]));
    console.log(formData.get('labels'));
    // startTransition(() => createProjectAction(formData));
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
  }, [state, router]);

  return (
    <div className="space-y-4">
      <form ref={formRef} onSubmit={handleSubmit(onSubmitHandler)}>
        <header className="mb-4 flex flex-row items-center gap-2">
          <Plus size={20} className="text-primary" />
          <h2 className="text-primary text-md">Add Project Label</h2>
        </header>
        <div className="mb-2 flex flex-row items-center gap-2">
          <label className="text-sm font-medium">Task Label</label>

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
          <p className="mt-2 text-sm text-red-400">{errors.labels?.message}</p>
        </div>
        {/* Server side error */}
        <div className="my-4">
          {state?.success === false && (
            <ErrorBox key={`error-${errorCount}`} message={state.error!} />
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
            {isPending ? 'Adding' : `Add Label`}
          </Button>
        </div>
      </form>
    </div>
  );
}
