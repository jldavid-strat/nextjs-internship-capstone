import React from 'react';
import { Dialog, DialogContent, DialogDescription } from './dialog';
import { DialogTitle, DialogTrigger } from '@radix-ui/react-dialog';
import { cn } from '../../lib/utils/shadcn-utils';

export type ModalProps = {
  isOpen: boolean;
  setIsOpen: (input: boolean) => void;
  children: React.ReactNode;
  triggerComponent?: React.ReactNode;
  className?: string;
};

export default function Modal({
  isOpen,
  setIsOpen,
  children,
  className,
  triggerComponent,
}: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {triggerComponent && <DialogTrigger asChild>{triggerComponent}</DialogTrigger>}
      <DialogContent
        className={cn('border-border max-h-screen overflow-y-scroll lg:max-w-screen-lg', className)}
      >
        <DialogTitle className="sr-only"></DialogTitle>
        <DialogDescription className="sr-only"></DialogDescription>

        {/* 
        
        Add <DialogClose aSchild> in children to add a trigger to manually close the modal
        
        */}
        {children}
      </DialogContent>
    </Dialog>
  );
}
