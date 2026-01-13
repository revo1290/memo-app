'use client';

import { useState, useEffect, useTransition, useRef } from 'react';
import { Input, Button } from '@/components/ui';
import { updateTag } from '@/server/actions/tag';
import type { Tag } from '@prisma/client';

const PRESET_COLORS = [
  '#EF4444', // red
  '#F97316', // orange
  '#EAB308', // yellow
  '#22C55E', // green
  '#06B6D4', // cyan
  '#3B82F6', // blue
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#6B7280', // gray
];

interface TagEditDialogProps {
  tag: Tag;
  isOpen: boolean;
  onClose: () => void;
}

export function TagEditDialog({ tag, isOpen, onClose }: TagEditDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(tag.name);
  const [color, setColor] = useState(tag.color || '#6B7280');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setName(tag.name);
    setColor(tag.color || '#6B7280');
  }, [tag]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      if (!isPending) {
        onClose();
      }
    };

    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onClose, isPending]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === dialogRef.current && !isPending) {
      onClose();
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('タグ名を入力してください');
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set('name', name.trim());
      formData.set('color', color);

      const result = await updateTag(tag.id, formData);

      if (result.success) {
        setError('');
        onClose();
      } else if (result.errors?.name) {
        setError(result.errors.name[0]);
      } else if (result.error) {
        setError(result.error);
      }
    });
  };

  return (
    <dialog
      ref={dialogRef}
      className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-0 shadow-xl backdrop:bg-black/50 w-full max-w-sm m-0"
      onClick={handleBackdropClick}
    >
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">タグを編集</h2>

        <div className="space-y-4">
          <Input
            label="タグ名"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder="タグ名"
            error={error}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">色</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    color === c ? 'border-gray-800 ring-2 ring-gray-300' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`色: ${c}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isPending}
          >
            キャンセル
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={isPending}
            disabled={!name.trim() || (name === tag.name && color === tag.color)}
          >
            保存
          </Button>
        </div>
      </div>
    </dialog>
  );
}
