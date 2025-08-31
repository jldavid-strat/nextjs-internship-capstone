import Modal from '../ui/modal';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { CreateTaskProps, AddTaskForm } from '../forms/add-task-form';

export default function AddTaskModal({ kanbanData }: { kanbanData: CreateTaskProps }) {
  return (
    <Modal
      className="max-h-[700px] w-[600px]"
      triggerComponent={
        <Button variant={'outline'}>
          <Plus size={12} />
        </Button>
      }
    >
      <AddTaskForm kanbanData={kanbanData} />
    </Modal>
  );
}
