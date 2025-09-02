'use client';

import { TaskSheetProps } from '@/components/dropdowns/task-dropdown';
import { KanbanColumn, Label, Task } from '@/types/db.types';
import { create } from 'zustand';

export type ModalType =
  | 'addTask'
  | 'deleteTask'
  | 'addColumn'
  | 'editColumn'
  | 'deleteColumn'
  | 'addTaskComment'
  | 'editTaskComment'
  | 'deleteTaskComment'
  | 'addProjectLabel'
  | 'editProjectLabel';

type ModalState = {
  modals: Record<ModalType, string | null>;

  openModal: (type: ModalType, entityId?: string) => void;
  closeModal: (type: ModalType) => void;
  closeAllModals: () => void;

  isModalOpen: (type: ModalType) => boolean;
  getModalEntityId: (type: ModalType) => string | null;
};

const initialModals: Record<ModalType, string | null> = {
  addTask: null,
  deleteTask: null,
  addColumn: null,
  editColumn: null,
  deleteColumn: null,
  addTaskComment: null,
  editTaskComment: null,
  deleteTaskComment: null,
  addProjectLabel: null,
  editProjectLabel: null,
};

export const useModalStore = create<ModalState>((set, get) => ({
  modals: initialModals,

  openModal: (type, entityId = undefined) =>
    set((state) => ({
      modals: { ...state.modals, [type]: entityId ?? 'open' },
    })),

  closeModal: (type) =>
    set((state) => ({
      modals: { ...state.modals, [type]: null },
    })),

  closeAllModals: () => set({ modals: initialModals }),

  isModalOpen: (type) => get().modals[type] !== null,
  getModalEntityId: (type) => get().modals[type],
}));

// custom hook for shadcn Dialog integration
export const useDialogModal = (type: ModalType) => {
  const isOpen = useModalStore((state) => state.modals[type] !== null);
  const entityId = useModalStore((state) => state.modals[type]);
  const closeModal = useModalStore((state) => state.closeModal);

  return {
    open: isOpen,
    entityId,
    onOpenChange: (open: boolean) => {
      if (!open) closeModal(type);
    },
  };
};

// action hooks for modals
export const useModalActions = () => {
  const { openModal, closeModal, closeAllModals } = useModalStore();

  return {
    addTask: () => openModal('addTask'),
    deleteTask: (id: Task['id']) => openModal('deleteTask', id.toString()),
    addColumn: () => openModal('addColumn'),
    editColumn: (id: KanbanColumn['id']) => openModal('editColumn', id),
    deleteColumn: (id: KanbanColumn['id']) => openModal('deleteColumn', id),
    addTaskComment: () => openModal('addTaskComment'),
    editTaskComment: (id: string) => openModal('editTaskComment', id),
    deleteTaskComment: (id: string) => openModal('deleteTaskComment', id),
    addProjectLabel: () => openModal('addProjectLabel'),
    editProjectLabel: (id: Label['id']) => openModal('editProjectLabel', id.toString()),
    close: closeModal,
    closeAll: closeAllModals,
  };
};

type SheetStore = {
  isTaskOpen: boolean;
  taskSheetData: TaskSheetProps | null;
  open: (taskSheetData: TaskSheetProps) => void;
  close: () => void;
  reset: () => void;
};

export const useSheetStore = create<SheetStore>((set) => ({
  isTaskOpen: false,
  taskSheetData: null,
  open: (taskSheetData) => set({ isTaskOpen: true, taskSheetData }),
  close: () => set({ isTaskOpen: false }),
  reset: () => set({ isTaskOpen: false, taskSheetData: null }),
}));
