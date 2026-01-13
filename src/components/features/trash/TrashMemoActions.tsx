'use client';

import { useState, useTransition } from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import { IconButton, ConfirmDialog } from '@/components/ui';
import { restoreMemo, permanentlyDeleteMemo } from '@/server/actions/memo';

interface TrashMemoActionsProps {
  memoId: string;
  memoTitle: string;
}

export function TrashMemoActions({ memoId, memoTitle }: TrashMemoActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleRestore = () => {
    startTransition(async () => {
      await restoreMemo(memoId);
    });
  };

  const handlePermanentDelete = () => {
    startTransition(async () => {
      await permanentlyDeleteMemo(memoId);
      setShowDeleteDialog(false);
    });
  };

  return (
    <>
      <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <IconButton
          variant="secondary"
          size="sm"
          label="復元"
          onClick={handleRestore}
          disabled={isPending}
        >
          <RotateCcw className="h-4 w-4" />
        </IconButton>
        <IconButton
          variant="danger"
          size="sm"
          label="完全に削除"
          onClick={() => setShowDeleteDialog(true)}
          disabled={isPending}
        >
          <Trash2 className="h-4 w-4" />
        </IconButton>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title="メモを完全に削除"
        description={`「${memoTitle}」を完全に削除しますか？この操作は取り消せません。`}
        confirmText="完全に削除"
        variant="danger"
        onConfirm={handlePermanentDelete}
        isLoading={isPending}
      />
    </>
  );
}
