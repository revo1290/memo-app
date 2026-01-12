'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'default';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = '確認',
  cancelText = 'キャンセル',
  variant = 'default',
  isLoading = false,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  // ESCキーでの閉じるを処理
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      if (!isLoading) {
        onClose();
      }
    };

    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onClose, isLoading]);

  // 背景クリックで閉じる
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === dialogRef.current && !isLoading) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        'rounded-lg bg-white p-0 shadow-xl backdrop:bg-black/50',
        'w-full max-w-md'
      )}
      onClick={handleBackdropClick}
    >
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {description && (
          <p className="mt-2 text-sm text-gray-500">{description}</p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
