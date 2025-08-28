import React from 'react';
import { Dialog, DialogOverlay, DialogContent } from './dialog';

export type ModalProps = {
  isOpen: boolean;
  setIsOpen: (input: boolean) => void;
  children: React.ReactNode;
};

export default function Modal({ isOpen, setIsOpen, children }: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogOverlay>
        <DialogContent className="border-border overflow-y-hidden">{children}</DialogContent>
      </DialogOverlay>
    </Dialog>
  );
}
