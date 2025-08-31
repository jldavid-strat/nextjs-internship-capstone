import React from 'react';
import Modal from '../ui/modal';
import { Button } from '../ui/button';
import EditProjectLabelForm, { EditProjectLabelFormProps } from '../forms/edit-project-label-form';

export default function EditProjectLabelModal({
  projectLabelData,
  disabled = false,
}: {
  projectLabelData: EditProjectLabelFormProps;
  disabled: boolean;
}) {
  return (
    <Modal
      className="w-[500px]"
      triggerComponent={
        <Button disabled={disabled} variant="outline">
          Edit
        </Button>
      }
    >
      <EditProjectLabelForm projectLabelData={projectLabelData} />
    </Modal>
  );
}
