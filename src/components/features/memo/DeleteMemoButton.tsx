'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { Button, ConfirmDialog } from '@/components/ui';
import { deleteMemo } from '@/server/actions/memo';

interface DeleteMemoButtonProps {
  memoId: string;
  memoTitle: string;
}

export function DeleteMemoButton({ memoId, memoTitle }: DeleteMemoButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteMemo(memoId);
      if (result.success) {
        router.push('/');
      }
    });
  };

  return (
    <>
      <Button
        variant="danger"
        size="sm"
        onClick={() => setIsOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
        削除
      </Button>

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
