// src/components/modals/AddGuestModal.tsx
'use client';

import { Modal } from '../../../../../components/ui/Modal';
import RegisterForm from '../../../../../components/forms/RegisterForm';
import { useLanguage } from '../../../../../context/LanguageContext'; // Import Language Hook

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AddGuestModal({ open, onClose }: Props) {
  const { t } = useLanguage();

  return (
    <Modal title={`${t('add')} ${t('guest')}`} onClose={onClose} className="p-0">
      <RegisterForm onClose={onClose} forceRole="customer" />
    </Modal>
  );
}