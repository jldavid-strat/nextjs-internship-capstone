'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ColumnDef, Row } from '@tanstack/react-table';
import { ProjectLabelTableData } from '../project-label-table';
import { deleteProjectLabel } from '@/actions/project_labels.actions';
import { useState } from 'react';
import { DEFAULT_COLOR } from '@/lib/validations/project-label.validations';
import { useModalActions } from '@/stores/modal-store';
import EditProjectLabelForm from '@/components/forms/edit-project-label-modal-form';

export const projectLabelColumns = (canMutate: boolean): ColumnDef<ProjectLabelTableData>[] => [
  {
    accessorKey: 'labelName',
    header: () => <div className="text-center">Label</div>,
    cell: ({ row }) => {
      const label = row.original;
      return (
        <div className="flex flex-row items-center justify-center gap-2">
          <Badge
            className="text-sm"
            style={{ color: label.color ?? DEFAULT_COLOR }}
            variant="outline"
          >
            {label.labelName}
          </Badge>
        </div>
      );
    },
  },
  ...(canMutate ? actionColumn : []),
];

const actionColumn: ColumnDef<ProjectLabelTableData>[] = [
  {
    id: 'actions',
    cell: ({ row }) => <ActionCell row={row} />,
  },
];

function ActionCell({ row }: { row: Row<ProjectLabelTableData> }) {
  const [isPending, setIsPending] = useState<boolean>(false);
  const label = row.original;

  const handleDelete = async (labelId: ProjectLabelTableData['labelId']) => {
    setIsPending(true);
    console.log('Delete:', labelId);
    const { success } = await deleteProjectLabel(label.labelId, label.projectId);

    setIsPending(false);

    // show toast
    if (!success) alert('did not delete');
    alert('did delete');
    // call delete project label server action
  };

  return (
    <div className="flex flex-row items-center justify-center gap-2">
      {/* open edit project label modal */}
      <EditProjectLabelForm
        projectLabelData={{
          projectLabelId: label.id,
          labelId: label.labelId,
          name: label.labelName,
          projectId: label.projectId,
          color: label.color,
        }}
      />
      <Button
        className="border-destructive/60 dark:text-foreground border-1 bg-red-500/20 text-red-500 hover:bg-red-500/30"
        onClick={() => {
          handleDelete(label.labelId);
        }}
      >
        {isPending ? 'Deleting' : 'Delete'}
      </Button>
    </div>
  );
}
