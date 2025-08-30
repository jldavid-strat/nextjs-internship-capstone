import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { ProjectLabelTableData } from '../project-label-table';

export const projectLabelColumns = (canMutate: boolean): ColumnDef<ProjectLabelTableData>[] => [
  {
    accessorKey: 'labelName',
    header: () => <div className="text-center">Label</div>,
    cell: ({ row }) => {
      const label = row.original;
      return (
        <div className="flex flex-row items-center justify-center gap-2">
          <Badge className="text-sm" style={{ color: label.color ?? '#017de2' }} variant="outline">
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
    cell: ({ row }) => {
      const label = row.original;
      return (
        <div className="flex flex-row items-center justify-center gap-2">
          <Button variant="outline" onClick={() => console.log('Edit:', label.labelId)}>
            Edit
          </Button>
          <Button
            className="border-destructive/60 dark:text-foreground border-1 bg-red-500/20 text-red-500 hover:bg-red-500/30"
            onClick={() => console.log('Delete:', label.labelId)}
          >
            Delete
          </Button>
        </div>
      );
    },
  },
];
