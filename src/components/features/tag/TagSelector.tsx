'use client';

import { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { Badge, Button, Input } from '@/components/ui';
import { createTag } from '@/server/actions/tag';
import type { TagWithCount } from '@/types';

interface TagSelectorProps {
  tags: TagWithCount[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function TagSelector({ tags, selectedIds, onChange }: TagSelectorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleTag = (tagId: string) => {
    if (selectedIds.includes(tagId)) {
      onChange(selectedIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedIds, tagId]);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.set('name', newTagName.trim());

    const result = await createTag(formData);

    if (result.success && result.data) {
      onChange([...selectedIds, result.data.id]);
      setNewTagName('');
      setIsCreating(false);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="space-y-3">
      {/* Selected Tags Display */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedIds.map((id) => {
            const tag = tags.find((t) => t.id === id);
            if (!tag) return null;
            return (
              <Badge
                key={id}
                color={tag.color || undefined}
                removable
                onRemove={() => toggleTag(id)}
              >
                {tag.name}
              </Badge>
            );
          })}
        </div>
      )}

      {/* Tag Options */}
      <div className="flex flex-wrap gap-2">
        {tags
          .filter((tag) => !selectedIds.includes(tag.id))
          .map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: tag.color || '#6B7280' }}
              />
              {tag.name}
              <Plus className="h-3 w-3 text-gray-400" />
            </button>
          ))}

        {/* Create New Tag Button */}
        {!isCreating && (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-gray-300 bg-white px-3 py-1 text-sm text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700"
          >
            <Plus className="h-3 w-3" />
            新規タグ
          </button>
        )}
      </div>

      {/* Create New Tag Form */}
      {isCreating && (
        <div className="flex items-center gap-2">
          <Input
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="タグ名を入力"
            className="max-w-[200px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCreateTag();
              } else if (e.key === 'Escape') {
                setIsCreating(false);
                setNewTagName('');
              }
            }}
            autoFocus
          />
          <Button
            type="button"
            size="sm"
            onClick={handleCreateTag}
            isLoading={isSubmitting}
            disabled={!newTagName.trim()}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsCreating(false);
              setNewTagName('');
            }}
          >
            キャンセル
          </Button>
        </div>
      )}
    </div>
  );
}
