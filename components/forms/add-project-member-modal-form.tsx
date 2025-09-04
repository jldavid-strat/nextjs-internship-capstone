'use client';

import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { addProjectMembers, getProjectMembers } from '@/actions/project_member.actions';
import { Project, User } from '@/types/db.types';
import { Loader2, Plus, UserPlus } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AddMemberMultiSelect, MemberValue } from '../ui/add-member-multiselect';
import {
  AddProjectMemberSchema,
  AddProjectMemberType,
} from '@/lib/validations/project.validations';
import { ErrorBox } from '../ui/error-box';
import { getSuggestedUsersByEmail } from '@/actions/user.actions';
import Modal from '../ui/modal';
import { Button } from '../ui/button';
import { toast } from 'sonner';

export default function AddProjectMemberForm({ projectId }: { projectId: Project['id'] }) {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AddProjectMemberType>({
    resolver: zodResolver(AddProjectMemberSchema),
    defaultValues: {
      members: [],
    },
  });

  const formRef = useRef(null);

  const [errorCount, setErrorCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | string[]>('');
  const [isPending, setIsPending] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const onSubmitHandler = async (data: AddProjectMemberType) => {
    setIsPending(true);

    console.log('data.members', data.members);
    const response = await addProjectMembers(projectId, data.members as MemberValue[]);
    if (!response.success) {
      setErrorCount((prev) => prev + 1);
      setErrorMessage(response.error);
      setIsPending(false);
      setIsModalOpen(true);
      return;
    }
    toast.success('Successfully added project members');
    setIsPending(false);
    setIsModalOpen(false);
  };

  const fetchUsersByEmail = async (searchTerm: string): Promise<User[]> => {
    const projectMembers = await getProjectMembers(projectId);

    console.log('already projectMembers', projectMembers);

    if (!projectMembers || projectMembers.length > 0) {
      const projectMemberIds = projectMembers?.map((m) => m.userData.id);
      console.log('already projectMemberIds', projectMemberIds);
      return getSuggestedUsersByEmail(
        searchTerm,

        // exclude project members as options
        projectMemberIds,
      );
    }

    return getSuggestedUsersByEmail(searchTerm);
  };

  return (
    <Modal
      isOpen={isModalOpen}
      setIsOpen={(isModalOpen) => {
        setIsModalOpen(isModalOpen);
        if (!isModalOpen) {
          // disable scroll lock due to overflow auto

          document.body.style.overflow = '';
          // clears the form when dialog closes
          reset();
        }
      }}
      className="w-[500px] overflow-x-hidden"
      triggerComponent={
        <Button type="button">
          <UserPlus size={12} />
        </Button>
      }
    >
      <div className="space-y-4">
        <form
          ref={formRef}
          onSubmit={handleSubmit(onSubmitHandler)}
          className="flex flex-col gap-2"
        >
          <header className="mb-4 flex flex-row items-center gap-2">
            <UserPlus size={20} className="text-primary" />
            <h2 className="text-primary text-md">Add Project Members</h2>
          </header>
          <Controller
            name="members"
            control={control}
            render={({ field }) => (
              <AddMemberMultiSelect
                value={field.value}
                onChange={field.onChange}
                fetchFunction={fetchUsersByEmail}
                emptyMessage="No users with this email"
                searchPlaceholder="Search users via email"
              />
            )}
          />
          {errors.members && <p className="bg-red-400 text-sm">{errors.members?.message}</p>}

          {/* Server side error */}
          <div className="my-4">
            {errorMessage && <ErrorBox key={`error-${errorCount}`} message={errorMessage} />}
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
              {isPending ? 'Adding' : `Add Project Members`}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
