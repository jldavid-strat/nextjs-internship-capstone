import Modal from '../ui/modal';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import AddProjectLabelForm from '../forms/add-project-label-form';
import { Project } from '@/types/db.types';

export default function AddProjectLabelModal({ projectId }: { projectId: Project['id'] }) {
  return (
    <Modal
      className="w-[500px]"
      triggerComponent={
        <Button>
          <Plus size={12} />
        </Button>
      }
    >
      <AddProjectLabelForm projectId={projectId} />
    </Modal>
  );
}
