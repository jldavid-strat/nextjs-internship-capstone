import { CircleAlert } from 'lucide-react';
import { Button } from '../ui/button';
import SubHeader from '../ui/subheader';

export default function EditDangerZone() {
  return (
    <>
      <SubHeader
        title={'Danger Zone'}
        description={'Substantial or irreversible actions for project'}
        icon={<CircleAlert size={20} />}
        color="text-red-400"
      />

      <div className="border-border bg-input/30 mb-4 flex flex-row items-center justify-between rounded-sm border-1 p-4">
        <div className="flex w-full flex-row items-center justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-primary">Transfer Ownership</p>
            <p className="text-muted-foreground text-sm">Assign someone as the project owner</p>
          </div>
          <Button type="button" variant={'default'}>
            Archive
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-row items-center justify-between rounded-sm border-1 border-yellow-200 bg-yellow-400/10 p-4 dark:bg-yellow-900/20">
        <div className="flex w-full flex-row justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-yellow-900 dark:text-yellow-300">Archive Project</p>
            <p className="text-sm text-yellow-900/60 dark:text-yellow-200">
              Set this project to archive
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant={'outline'}
          className="bg-transparent text-yellow-900 dark:border-yellow-200 dark:text-yellow-200"
        >
          Transfer
        </Button>
      </div>

      <div className="border-destructive/50 bg-destructive/10 mb-4 flex flex-row justify-between rounded-sm border-1 p-4">
        <div className="flex w-full flex-row items-center justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-destructive">Delete Project</p>
            <p className="text-destructive/50 text-sm">
              Remove all relevant data about the this project
            </p>
          </div>
          <div>
            <Button
              type="button"
              variant={'outline'}
              className="dark:border-destrutive/50 text-destructive bg-transparent"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
