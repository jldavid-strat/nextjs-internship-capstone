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
import { Button } from '../ui/button';
import { Pencil } from 'lucide-react';
import { ErrorBox } from '../ui/error-box';
import Modal from '../ui/modal';
import { toast } from 'sonner';
import { Project, User } from '@/types/db.types';
import {
  ChangeRoleMemberSchema,
  ChangeRoleMemberSchemaType,
} from '@/lib/validations/project.validations';
import { CHANGE_ROLE_VALUES, ChangeMemberRole } from '@/lib/db/schema/enums';
import { changeMemberRole } from '@/actions/project_member.actions';

type ChangeMemberRoleProps = {
  isEditOpen: boolean;
  setIsEditOpen: Dispatch<SetStateAction<boolean>>;
  projectMemberData: {
    projectId: Project['id'];
    userId: User['id'];
    memberName: string;
    role: ChangeMemberRole;
  };
};

export default function ChangeMemberRoleForm({
  isEditOpen,
  setIsEditOpen,
  projectMemberData,
}: ChangeMemberRoleProps) {
  const { projectId, memberName, role, userId } = projectMemberData;
  const [state, changeMemberRoleAction, isPending] = useActionState(
    changeMemberRole.bind(null, projectId, userId),
    undefined,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangeRoleMemberSchemaType>({
    mode: 'onBlur',
    resolver: zodResolver(ChangeRoleMemberSchema),
    defaultValues: {
      role: role,
    },
  });

  const [errorCount, setErrorCount] = useState<number>(0);

  const formRef = useRef(null);

  const onSubmitHandler = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    handleSubmit(() => {
      // console.log(new FormData(formRef.current!));
      startTransition(() => changeMemberRoleAction(new FormData(formRef.current!)));
    })(evt);
  };

  useEffect(() => {
    if (state?.success === false && state?.error) {
      //   always increment on unsuccesful attempt
      setErrorCount((prev) => prev + 1);
    }
    if (state?.success === true) {
      setIsEditOpen(false);
      toast.success('Succesfully changed member role');
    }
  }, [state, projectId, setIsEditOpen]);

  return (
    <>
      <Modal className="w-[350px]" isOpen={isEditOpen} setIsOpen={setIsEditOpen}>
        <div className="space-y-4">
          <form ref={formRef} onSubmit={onSubmitHandler}>
            <header className="mb-4 flex flex-row items-center gap-2">
              <Pencil size={20} className="text-primary" />
              <h2 className="text-primary text-md">Change Role Member</h2>
            </header>
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium">Member Name</label>
              <p className="text-muted-foreground mt-2 text-sm">{memberName}</p>
            </div>
            <div className="items-center gap-2">
              <label className="mb-2 block text-sm font-medium">Role</label>
              <select
                {...register('role')}
                name="role"
                className="bg-card border-border h-8.5 w-[150px] rounded-lg border px-2 capitalize focus:outline-hidden focus-visible:ring"
                defaultValue={role}
              >
                {CHANGE_ROLE_VALUES.map((role, index) => (
                  <option key={index} value={role}>
                    {role}
                  </option>
                ))}
              </select>
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
                {isPending ? 'Saving' : `Change Role`}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
