import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '../ui/button';

interface DeleteAlertDialogProps {
  isOpen: boolean;
  alertTile?: string;
  alertDescription?: string;
  setIsOpen: (i: boolean) => void;
  handleDelete: () => Promise<void>;
}

export function DeleteAlertDialog({
  isOpen,
  setIsOpen,
  handleDelete,
  alertTile = 'Are you absolutely sure?',
  alertDescription = 'This action cannot be undone. This will permanently delete your account and remove your data from our servers.',
}: DeleteAlertDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{alertTile}</AlertDialogTitle>
          <AlertDialogDescription>{alertDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsOpen(false)}>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button type="button" onClick={() => handleDelete}>
              Delete
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
