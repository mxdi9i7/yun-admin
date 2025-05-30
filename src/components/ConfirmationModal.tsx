'use client';

import { Dialog } from '@headlessui/react';
import { ReactNode } from 'react';
import Modal from '@/components/Modal';
import LoadingButton from '@/components/LoadingButton';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  confirmDisabled?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  isLoading = false,
  confirmDisabled = false,
}: ConfirmationModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className='mt-2'>
        <div className='text-sm text-gray-500 dark:text-gray-400'>
          {message}
        </div>
      </div>

      <div className='mt-4 flex justify-end space-x-3'>
        <LoadingButton
          type='button'
          variant='secondary'
          onClick={onClose}
          disabled={isLoading}
        >
          {cancelText}
        </LoadingButton>
        <LoadingButton
          type='button'
          variant='danger'
          onClick={onConfirm}
          isLoading={isLoading}
          loadingText='处理中...'
          disabled={confirmDisabled}
        >
          {confirmText}
        </LoadingButton>
      </div>
    </Modal>
  );
}
