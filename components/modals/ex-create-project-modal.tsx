import React from 'react';
import { DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import Modal, { type ModalProps } from '../ui/modal';
import CreateProjectForm from '../forms/create-project-form';

export default function CreateProjectModal({
  isOpen,
  setIsOpen,
}: Pick<ModalProps, 'isOpen' | 'setIsOpen'>) {
  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <DialogHeader>
        <DialogTitle>Create Project</DialogTitle>
        <DialogDescription>Make a place to put your upcoming tasks</DialogDescription>
      </DialogHeader>
      <CreateProjectForm setIsOpen={setIsOpen} />
    </Modal>
  );
}
