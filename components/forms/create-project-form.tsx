'use client';

import { createProject } from '@/actions/project.actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { startTransition, useActionState, useCallback, useEffect, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import {
  InsertProjectFormSchema,
  InsertProjectFormType,
} from '@/lib/validations/project.validations';
import { Info, User as UserIcon } from 'lucide-react';
import { User } from '@/types/db.types';
import { getSuggestedUsersByEmail } from '@/actions/user.actions';
import { AddMemberMultiSelect } from '../ui/add-member-multiselect';
import { ErrorBox } from '../ui/error-box';

export default function CreateProjectForm({ currentUserId }: { currentUserId: User['id'] }) {
  const [state, createProjectAction, isPending] = useActionState(createProject, undefined);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<InsertProjectFormType>({
    mode: 'onBlur',
    resolver: zodResolver(InsertProjectFormSchema),
    defaultValues: {
      ownerId: currentUserId.toString(),
      members: [],
    },
  });

  const formRef = useRef(null);
  const router = useRouter();

  const handleCancel = () => {
    router.push('/projects');
  };

  const onSubmitHandler = (data: InsertProjectFormType) => {
    const formData = new FormData();
    const ownerData = {
      userId: currentUserId,
      role: 'owner',
    };
    formData.append('title', data.title);
    formData.append('owner-id', data.ownerId);
    formData.append('due-date', data.dueDate ?? '');
    formData.append('description', data.description ?? '');
    formData.append('members', JSON.stringify([...(data.members ?? []), ownerData]));

    startTransition(() => createProjectAction(formData));
  };

  const fetchUsersByEmail = useCallback(
    async (searchTerm: string): Promise<User[]> => {
      return await getSuggestedUsersByEmail(searchTerm, [currentUserId]);
    },
    [currentUserId],
  );

  // NOTE only handle success state
  useEffect(() => {
    if (state?.success) {
      // alert('Successfully added project');
      // redirect to newly project page
      router.push(`/projects/${state.data}`);
    }
    return;
  }, [state, router]);
  return (
    <div className="max-w-[800px] space-y-4">
      <form ref={formRef} onSubmit={handleSubmit(onSubmitHandler)}>
        <section>
          <header className="mb-4 flex flex-row items-center gap-2">
            <Info size={20} className="text-primary" />
            <h2 className="text-primary text-md">Project Details</h2>
          </header>
          <div>
            <label className="mb-2 block text-sm font-medium">Project Title *</label>
            {/* TODO: add way to auto-focus title input */}
            <Input
              {...register('title')}
              type="text"
              name="title"
              placeholder="Enter project name"
            />
            <p className="mt-2 text-sm text-red-400">{errors.title?.message}</p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Description</label>
            <textarea
              {...register('description')}
              name="description"
              rows={3}
              className="focus:ring-visible border-border bg-input/30 w-full rounded-lg border px-3 py-2 text-sm focus:outline-hidden"
              placeholder="Describe what your project entails"
            />
            <p className="mt-2 text-sm text-red-400">{errors.description?.message}</p>
          </div>
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium">Due Date</label>
            <Input
              {...register('dueDate', { setValueAs: (val) => (val === '' ? null : val) })}
              type="date"
              name="dueDate"
              className="w-fit"
            />
            <p className="mt-2 text-sm text-red-400">{errors.dueDate?.message}</p>
          </div>
        </section>

        <section>
          <header className="mb-4 flex flex-row items-center gap-2">
            <UserIcon size={20} className="text-primary" />
            <h2 className="text-primary text-md">Add Project Member</h2>
          </header>

          <div className="flex flex-col gap-2">
            <Controller
              name="members"
              control={control}
              render={({ field }) => (
                <AddMemberMultiSelect
                  value={field.value || []}
                  onChange={field.onChange}
                  fetchFunction={fetchUsersByEmail}
                />
              )}
            />

            {errors.ownerId && <p className="bg-red-400 text-sm">{errors.ownerId?.message}</p>}
            {errors.members && <p className="bg-red-400 text-sm">{errors.members?.message}</p>}
          </div>
        </section>

        {/* Server side error */}
        <div className="my-4">{state?.success === false && <ErrorBox message={state.error} />}</div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            disabled={isPending}
            variant={'cancel'}
            onClick={() => {
              handleCancel();
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant={'default'}
            className={`${isPending ? 'cursor-progress' : 'cursor-pointer'}`}
          >
            {isPending ? 'Creating' : `Create Project`}
          </Button>
        </div>
      </form>
    </div>
  );
}
