'use client';

import { useState, useTransition } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { IconButton, Input, Button } from '@/components/ui';
import { createTag } from '@/server/actions/tag';

export function TagCreateButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6B7280');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('タグ名を入力してください');
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set('name', name.trim());
      formData.set('color', color);

      const result = await createTag(formData);

      if (result.success) {
        setName('');
        setColor('#6B7280');
        setError('');
        setIsOpen(false);
      } else if (result.errors?.name) {
        setError(result.errors.name[0]);
      } else if (result.error) {
        setError(result.error);
      }
    });
  };

  if (!isOpen) {
    return (
      <IconButton
        label="タグを追加"
        size="sm"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="h-4 w-4" />
      </IconButton>
    );
  }

  return (
    <div className="absolute left-4 right-4 top-full z-10 mt-2 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
      <div className="space-y-3">
        <Input
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
            } else if (e.key === 'Escape') {
              setIsOpen(false);
            }
          }}
        />

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">色:</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-8 w-8 cursor-pointer rounded border border-gray-200"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsOpen(false);
              setName('');
              setError('');
            }}
          >
            <X className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            isLoading={isPending}
            disabled={!name.trim()}
          >
            <Check className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
