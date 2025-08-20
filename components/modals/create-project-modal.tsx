// TODO: Task 4.1 - Implement project CRUD operations
// TODO: Task 4.4 - Build task creation and editing functionality

'use client';

import { createProject } from '@/lib/queries/project.queries';
import { X } from 'lucide-react';
import { startTransition, useActionState, useLayoutEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { ProjectSchema } from '@/lib/validations';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
/*
TODO: Implementation Notes for Interns:

Modal for creating new projects with form validation.

Features to implement:
- Form with project name, description, due date
- Zod validation
- Error handling
- Loading states
- Success feedback
- Team member assignment
- Project template selection

Form fields:
- Name (required)
- Description (optional)
- Due date (optional)
- Team members (optional)
- Project template (optional)
- Privacy settings

Integration:
- Use project validation schema from lib/validations.ts
- Call project creation API
- Update project list optimistically
- Handle errors gracefully
*/

// remove validation for values not included in form fields

const FormProjectSchema = ProjectSchema.pick({
  title: true,
  description: true,
  dueDate: true,
});
type FormProjectType = z.input<typeof FormProjectSchema>;

export function CreateProjectModal({ setIsOpen }: { setIsOpen: (setValue: boolean) => void }) {
  const [state, createProjectAction, isPending] = useActionState(createProject, undefined);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormProjectType>({
    resolver: zodResolver(FormProjectSchema),
  });

  const formRef = useRef(null);
  const router = useRouter();

  const onSubmitHandler = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    handleSubmit(() => {
      // console.log(new FormData(formRef.current!));
      startTransition(() => createProjectAction(new FormData(formRef.current!)));
    })(evt);
  };

  // NOTE only handle success state
  useLayoutEffect(() => {
    if (state?.success) {
      setIsOpen(false);
      // alert('Successfully added project');

      // redirect to newly project page
      // router.push(`/projects/${state.data}`);
    }
  }, [state, router, setIsOpen]);

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="dark:bg-outer_space-500 mx-4 w-full max-w-md rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-outer_space-500 dark:text-platinum-500 text-lg font-semibold">
            Create New Project
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded p-1"
          >
            <X size={20} />
          </button>
        </div>

        <form ref={formRef} onSubmit={onSubmitHandler} className="space-y-4">
          <div>
            <label className="text-outer_space-500 dark:text-platinum-500 mb-2 block text-sm font-medium">
              Project Title *
            </label>

            {/* TODO: add way to auto-focus title input */}
            <input
              {...register('title')}
              type="text"
              name="title"
              className="border-french_gray-300 dark:border-payne's_gray-400 dark:bg-outer_space-400 text-outer_space-500 dark:text-platinum-500 focus:ring-blue_munsell-500 w-full rounded-lg border bg-white px-3 py-2 focus:ring-2 focus:outline-hidden"
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
              className="border-french_gray-300 dark:border-payne's_gray-400 dark:bg-outer_space-400 text-outer_space-500 dark:text-platinum-500 focus:ring-blue_munsell-500 w-full rounded-lg border bg-white px-3 py-2 focus:ring-2 focus:outline-hidden"
              placeholder="Describe what your project entails"
            />
            <p className="mt-2 text-sm text-red-400">{errors.description?.message}</p>
          </div>

          <div>
            <label className="text-outer_space-500 dark:text-platinum-500 mb-2 block text-sm font-medium">
              Due Date
            </label>
            <input
              {...register('dueDate', { setValueAs: (val) => (val === '' ? null : val) })}
              type="date"
              name="dueDate"
              className="border-french_gray-300 dark:border-payne's_gray-400 dark:bg-outer_space-400 text-outer_space-500 dark:text-platinum-500 focus:ring-blue_munsell-500 w-full rounded-lg border bg-white px-3 py-2 focus:ring-2 focus:outline-hidden"
            />
            <p className="mt-2 text-sm text-red-400">{errors.dueDate?.message}</p>
          </div>

          {/* Server validation error messages */}
          {/* TODO display all error messages not just one */}
          <div>
            {state?.success === false && (
              <p className="mt-2 text-sm text-red-400">{`SERVER: ${state?.message}`}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              disabled={isPending}
              onClick={() => setIsOpen(false)}
              className="text-payne's_gray-500 dark:text-french_gray-400 hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded-lg px-4 py-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`bg-blue_munsell-500 hover:bg-blue_munsell-600 rounded-lg px-4 py-2 text-white transition-colors ${isPending ? 'cursor-progress' : 'cursor-pointer'}`}
            >
              {isPending ? 'Creating' : `Create Project`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
