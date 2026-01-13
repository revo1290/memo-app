'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import { Badge, IconButton, ConfirmDialog } from '@/components/ui';
import { deleteTag } from '@/server/actions/tag';
import { TagEditDialog } from './TagEditDialog';
import type { TagWithCount } from '@/types';

interface TagListItemProps {
  tag: TagWithCount;
  isActive: boolean;
}

export function TagListItem({ tag, isActive }: TagListItemProps) {
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteTag(tag.id);
      setShowDelete(false);
    });
  };

  return (
    <li className="group relative">
      <Link
        href={`/?tag=${tag.id}`}
        className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
          isActive
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <span className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: tag.color || '#6B7280' }}
          />
          {tag.name}
        </span>
        <span className="flex items-center gap-1">
          {tag._count && (
            <Badge size="sm" variant="default">
              {tag._count.memos}
            </Badge>
          )}
        </span>
      </Link>

      {/* Action buttons on hover */}
      <div className="absolute right-8 top-1/2 flex -translate-y-1/2 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <IconButton
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowEdit(true);
          }}
          label="タグを編集"
          className="text-gray-400 hover:text-blue-500"
        >
          <Pencil className="h-3.5 w-3.5" />
        </IconButton>
        <IconButton
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowDelete(true);
          }}
          label="タグを削除"
          className="text-gray-400 hover:text-red-500"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </IconButton>
      </div>

      <TagEditDialog
        tag={tag}
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
      />

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="タグを削除"
        description={`「${tag.name}」を削除しますか？このタグが付いているメモからタグが外れます。`}
        confirmText="削除"
        isLoading={isPending}
        variant="danger"
      />
    </li>
  );
}
