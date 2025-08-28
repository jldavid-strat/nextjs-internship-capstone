'use client';

import { startTransition, useActionState, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { getProjectMembers } from '@/lib/queries/project_member.queries';
import { addProjectMember } from '@/actions/project_member.actions';
import { Project, User } from '@/types/db.types';
import { Loader2 } from 'lucide-react';
import { UserMultiSelect } from '../ui/user-multiselect';
import { getSuggestedUsersByEmail } from '@/lib/queries/user.queries';
import { SELECT_ROLE_VALUES } from '@/lib/db/schema/enums';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const ProjectMemberFormSchema = z.object({
  members: z.array(z.string().trim()).min(1, 'Please select at least one user'),
  role: z.enum(SELECT_ROLE_VALUES),
});

type ProjectMemberFormType = z.infer<typeof ProjectMemberFormSchema>;

type AddProjectMemberFormProps = {
  userId: User['id'];
  projectId: Project['id'];
};

export default function AddProjectMemberForm(addProjectMemberProps: AddProjectMemberFormProps) {
  const { projectId } = addProjectMemberProps;

  const {
    handleSubmit,
    control,
    register,
    formState: { errors },
  } = useForm<ProjectMemberFormType>({
    resolver: zodResolver(ProjectMemberFormSchema),
    defaultValues: {
      members: [],
      role: 'member',
    },
  });

  const [state, addProjectMemberAction, isPending] = useActionState(
    addProjectMember.bind(null, {
      projectId: projectId,
    }),
    null,
  );
  const formRef = useRef(null);

  const onSubmitHandler = (data: ProjectMemberFormType) => {
    // console.log('Submitting:', data);

    const formData = new FormData();
    formData.append('role', data.role);
    formData.append('members', JSON.stringify(data.members));
    // data.members.forEach((memberId) => {
    //   formData.append('members', memberId);
    // });

    console.log(formData);

    startTransition(() => addProjectMemberAction(formData));
  };

  const fetchUsersByEmail = async (searchTerm: string): Promise<User[]> => {
    const { success, data: projectMembers } = await getProjectMembers(projectId);

    if (success || !projectMembers) {
      return getSuggestedUsersByEmail(
        searchTerm,

        // exclude project members as options
        projectMembers?.map((user) => user.userId),
      );
    }

    return getSuggestedUsersByEmail(searchTerm);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmitHandler)} className="flex flex-col gap-2">
      <Controller
        name="members"
        control={control}
        render={({ field }) => (
          <UserMultiSelect
            value={field.value}
            onChange={field.onChange}
            fetchFunction={fetchUsersByEmail}
          />
        )}
      />
      {errors.members && <p className="bg-red-400 text-sm">{errors.members?.message}</p>}

      <div>
        <label htmlFor="role">Role: </label>
        <select
          {...register('role')}
          name="role"
          className="border-french_gray-300 dark:border-payne's_gray-400 dark:bg-outer_space-400 text-outer_space-500 dark:text-platinum-500 focus:ring-blue_munsell-500 rounded-lg border bg-white px-3 py-2 focus:ring-2 focus:outline-hidden"
        >
          {SELECT_ROLE_VALUES.map((role, index) => (
            <option key={index} value={role}>
              {role}
            </option>
          ))}
        </select>
        <p className="bg-red-400 text-sm">{errors.role?.message}</p>
      </div>

      {/* Server Errors */}
      {state?.error && <p className="bg-red-400 text-sm">{state.message}</p>}

      <button
        disabled={isPending}
        type="submit"
        className={`w-[200px] rounded bg-blue-600 px-4 py-2 text-white ${isPending ? 'hover:cursor-progress' : 'hover:cursor-pointer'}`}
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {isPending ? `Adding` : `Add`}
      </button>
    </form>
  );
}
