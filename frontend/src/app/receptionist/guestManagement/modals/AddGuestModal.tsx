// src/components/modals/AddGuestModal.tsx
'use client';

import { Modal } from '../../../../../components/ui/Modal';
import RegisterForm from '../../../../../components/forms/RegisterForm';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AddGuestModal({ open, onClose }: Props) {


  return (
    <Modal title="Add New Guest" onClose={onClose} className="p-0">
      <RegisterForm onClose={onClose} forceRole="customer" />
    </Modal>
  );
}