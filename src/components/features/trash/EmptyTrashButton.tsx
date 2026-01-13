'use client';

import { useState, useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { Button, ConfirmDialog } from '@/components/ui';
import { emptyTrash } from '@/server/actions/memo';

interface EmptyTrashButtonProps {
  count: number;
}

export function EmptyTrashButton({ count }: EmptyTrashButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [showDialog, setShowDialog] = useState(false);

  const handleEmptyTrash = () => {
    startTransition(async () => {
      await emptyTrash();
      setShowDialog(false);
    });
  };

  return (
    <>
      <Button
        variant="danger"
        size="sm"
        onClick={() => setShowDialog(true)}
        disabled={isPending}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        ゴミ箱を空にする
      </Button>

      <ConfirmDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        title="ゴミ箱を空にする"
        description={`${count}件のメモを完全に削除しますか？この操作は取り消せません。`}
        confirmText="空にする"
        variant="danger"
        onConfirm={handleEmptyTrash}
        isLoading={isPending}
      />
    </>
  );
}
