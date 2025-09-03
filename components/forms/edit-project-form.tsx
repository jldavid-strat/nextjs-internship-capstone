'use client';

import { updateProject } from '@/actions/project.actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { startTransition, useActionState, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { EditProjectFormSchema, EditProjectFormType } from '@/lib/validations/project.validations';
import { PROJECT_STATUS_VALUES } from '@/lib/db/schema/enums';
import { Project } from '@/types/db.types';
import { BookOpenText, Edit } from 'lucide-react';
import { Badge } from '../ui/badge';
import { capitalize } from 'lodash';
import { ErrorBox } from '../ui/error-box';
import SubHeader from '../ui/subheader';
import { toast } from 'sonner';

const projectStatusBadgeStyle = {
  active: 'bg-primary/10 border-primary',
  completed: 'bg-green-400/10 border-green-400',
  archived: 'border-yellow-200 bg-yellow-500/20',
};

export default function EditProjectForm({ projectData }: { projectData: Project }) {
  const [state, updateProjectAction, isPending] = useActionState(
    updateProject.bind(null, projectData.id),
    undefined,
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditProjectFormType>({
    mode: 'onBlur',
    resolver: zodResolver(EditProjectFormSchema),
    defaultValues: {
      title: projectData.title,
      description: projectData.description,
      status: projectData.status,

      // only applies date string format when not null
      dueDate: projectData.dueDate && new Date(projectData.dueDate!).toISOString().split('T')[0],
    },
  });

  const [errorCount, setErrorCount] = useState(0);

  const formRef = useRef(null);
  const router = useRouter();

  const onSubmitHandler = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    handleSubmit(() => {
      // console.log(new FormData(formRef.current!));
      startTransition(() => updateProjectAction(new FormData(formRef.current!)));
    })(evt);
  };

  const handleCancel = () => {
    // reset the form field to previous values
    reset();
    setIsEditing(false);
  };

  // NOTE only handle success state
  useEffect(() => {
    if (state?.success === false && state?.error) {
      //   always increment on unsuccesful attempt
      setErrorCount((prev) => prev + 1);
    }
    if (state?.success === true) {
      setIsEditing(false);
      toast.success('Succesfully updated project information');
    }
  }, [state, router]);
  return (
    <form ref={formRef} onSubmit={onSubmitHandler}>
      <section className="mb-4 flex flex-row justify-between">
        <SubHeader
          title={'Project Details'}
          description={'General information about the project'}
          icon={<BookOpenText size={20} />}
          color="text-primary"
        />
        <div className="flex flex-row items-center gap-2">
          <Badge
            className={`h-fit rounded-full p-3 text-sm ${projectStatusBadgeStyle[projectData.status]}`}
            variant={'outline'}
          >
            {capitalize(projectData.status)}
          </Badge>
          <Button type="button" onClick={() => setIsEditing((prev) => !prev)}>
            <Edit className="hover:text-accent" />
          </Button>
        </div>
      </section>
      <div>
        <label className="mb-2 block text-sm font-medium">Project Title *</label>

        <Input
          {...register('title')}
          type="text"
          name="title"
          placeholder="Enter project name"
          readOnly={!isEditing}
        />
        <p className="mt-2 text-sm text-red-400">{errors.title?.message}</p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Description</label>
        <textarea
          {...register('description')}
          name="description"
          rows={3}
          placeholder="Describe what your project entails"
          readOnly={!isEditing}
          className="bg-input/30 border-border focus-visible:border-ring w-full rounded-lg border px-3 py-2 text-sm focus:outline-hidden"
        />
        <p className="mt-2 text-sm text-red-400">{errors.description?.message}</p>
      </div>

      <div className="my-4 flex flex-row gap-4">
        <div className="flex flex-row items-center gap-2">
          {projectData.dueDate || isEditing ? (
            <>
              <label className="text-sm font-medium">Due Date</label>
              <Input
                {...register('dueDate', {
                  // default input to undefine when clear button is pressed
                  setValueAs: (val) => (val === '' ? null : val),
                })}
                type="date"
                name="dueDate"
                className="w-fit"
                readOnly={!isEditing}
              />
            </>
          ) : (
            <p className="text-primary text-sm italic">No Due date</p>
          )}
        </div>

        <div className="flex flex-row items-center gap-2">
          {isEditing && (
            <>
              <label className="block text-sm font-medium">Project Status</label>
              <select
                {...register('status')}
                name="status"
                className="bg-card border-border h-8 w-[180px] rounded-lg border px-2 focus:outline-hidden focus-visible:ring"
              >
                {PROJECT_STATUS_VALUES.map((status, index) => (
                  <option key={index} value={status}>
                    {capitalize(status)}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>
      <p className="mt-2 text-sm text-red-400">{errors.dueDate?.message}</p>
      <p className="mt-2 text-sm text-red-400">{errors.status?.message}</p>

      {/* Server side error */}
      <div className="my-4">
        {state?.success === false && <ErrorBox key={`error-${errorCount}`} message={state.error} />}
      </div>

      {isEditing && (
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
          <Button type="submit" variant={'default'}>
            {isPending ? 'Saving' : `Save Changes`}
          </Button>
        </div>
      )}
    </form>
  );
}
