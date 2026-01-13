'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import { IconButton, ConfirmDialog } from '@/components/ui';
import { PinButton } from './PinButton';
import { deleteMemo } from '@/server/actions/memo';

interface MemoCardActionsProps {
  memoId: string;
  memoTitle: string;
  isPinned: boolean;
}

export function MemoCardActions({ memoId, memoTitle, isPinned }: MemoCardActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteMemo(memoId);
      setIsOpen(false);
    });
  };

  return (
    <>
      <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Link
          href={`/memo/${memoId}/edit`}
          onClick={(e) => e.stopPropagation()}
        >
          <IconButton
            variant="secondary"
            size="sm"
            label="編集"
          >
            <Pencil className="h-3.5 w-3.5" />
          </IconButton>
        </Link>
        <PinButton memoId={memoId} isPinned={isPinned} />
        <IconButton
          variant="danger"
          size="sm"
          label="削除"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(true);
          }}
          disabled={isPending}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </IconButton>
      </div>

      <ConfirmDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        title="メモを削除しますか？"
        description={`「${memoTitle}」をゴミ箱に移動します。ゴミ箱から復元できます。`}
        confirmText="ゴミ箱に移動"
        variant="danger"
        isLoading={isPending}
      />
    </>
  );
}
