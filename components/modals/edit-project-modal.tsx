'use client';

import { updateProject } from '@/actions/project.actions';
import { X } from 'lucide-react';
import { startTransition, useActionState, useLayoutEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { ProjectSchema } from '@/lib/validations';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Project } from '@/types/db.types';
import { PROJECT_STATUS_VALUES } from '@/lib/db/schema/enums';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

// TODO implement modal via shadcn component
const FormUpdateProjectSchema = ProjectSchema.pick({
  title: true,
  description: true,
  status: true,
  dueDate: true,
});
type UpdateProjectType = z.infer<typeof FormUpdateProjectSchema>;

type EditProjectProps = Pick<Project, 'title' | 'description' | 'status' | 'dueDate' | 'id'>;

export function EditProjectModal({
  projectData,
  setIsOpen,
}: {
  projectData: EditProjectProps;
  setIsOpen: (setValue: boolean) => void;
}) {
  const [state, updateProjectAction, isPending] = useActionState(
    updateProject.bind(null, projectData.id),
    undefined,
  );

  console.log(projectData);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProjectType>({
    resolver: zodResolver(FormUpdateProjectSchema),
    defaultValues: {
      title: projectData.title,
      description: projectData.description,
      status: projectData.status,

      // only applies date string format when not null
      dueDate: projectData.dueDate && new Date(projectData.dueDate!).toISOString().split('T')[0],
    },
  });

  const formRef = useRef(null);
  const router = useRouter();

  const onSubmitHandler = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    handleSubmit(() => {
      //   console.log(new FormData(formRef.current!));
      startTransition(() => updateProjectAction(new FormData(formRef.current!)));
    })(evt);
  };

  // NOTE only handle success state
  useLayoutEffect(() => {
    // console.log(getValues());
    if (state?.success) {
      setIsOpen(false);
      alert(state.message);
      // redirect to newly project page
      // router.push(`/projects/${state.data}`);
    }
  }, [state, setIsOpen]);

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-card border-border mx-4 w-full max-w-md rounded-lg border p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-outer_space-500 dark:text-platinum-500 text-lg font-semibold">
            Edit Project
          </h3>
          <Button
            onClick={() => setIsOpen(false)}
            className="text-foreground rounded bg-transparent p-1"
          >
            <X size={20} />
          </Button>
        </div>

        <form ref={formRef} onSubmit={onSubmitHandler} className="space-y-4">
          <div>
            <label className="text-outer_space-500 dark:text-platinum-500 mb-2 block text-sm font-medium">
              Project Title *
            </label>

            <Input
              {...register('title')}
              type="text"
              name="title"
              placeholder="Enter project name"
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
              rows={3}
              className="bg-input border-border focus-visible:border-ring w-full rounded-lg border px-3 py-2 focus:outline-hidden"
              placeholder="Describe what your project entails"
            />
            <p className="mt-2 text-sm text-red-400">{errors.description?.message}</p>
          </div>

          <div className="flex flex-row gap-2">
            <div>
              <label className="text-outer_space-500 dark:text-platinum-500 mb-2 block text-sm font-medium">
                Due Date
              </label>
              <Input
                {...register('dueDate', {
                  // default input to undefine when clear button is pressed
                  setValueAs: (val) => (val === '' ? null : val),
                })}
                type="date"
                name="dueDate"
                className="w-fit"
              />
              <p className="mt-2 text-sm text-red-400">{errors.dueDate?.message}</p>
              <p className="mt-2 text-sm text-red-400">{errors.root?.message}</p>
            </div>

            <div className="flex w-full flex-col gap-2">
              <label className="block text-sm font-medium">Project Status</label>
              <select
                {...register('status')}
                name="status"
                className="border-ring bg-card rounded-lg border px-3 py-2 focus:outline-hidden focus-visible:ring"
              >
                {PROJECT_STATUS_VALUES.map((status, index) => (
                  <option key={index} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="mt-2 text-sm text-red-400">{errors.status?.message}</p>
          {/* <div className="mt-2 text-sm text-red-400">{JSON.stringify(errors, null, 2)}</div> */}

          {/* Server validation error messages */}
          {/* TODO display all error messages not just one or ZodErrorsw */}
          <div>
            {state?.success === false && (
              <>
                <p className="mt-2 text-sm text-red-400">{`SERVER validation: ${JSON.stringify(state.error, null, 2)}`}</p>
                <p className="mt-2 text-sm text-red-400">{`SERVER: ${state.error}`}</p>
              </>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              disabled={isPending}
              variant={'cancel'}
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant={'default'}>
              {isPending ? 'Saving' : `Edit Project`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
