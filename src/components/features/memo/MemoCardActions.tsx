'use client';

import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { IconButton } from '@/components/ui';
import { PinButton } from './PinButton';

interface MemoCardActionsProps {
  memoId: string;
  isPinned: boolean;
}

export function MemoCardActions({ memoId, isPinned }: MemoCardActionsProps) {
  return (
    <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
      <Link
        href={`/memo/${memoId}/edit`}
        onClick={(e) => e.stopPropagation()}
      >
        <IconButton
          variant="secondary"
          size="sm"
          label="編集"
          title="編集"
        >
          <Pencil className="h-3.5 w-3.5" />
        </IconButton>
      </Link>
      <PinButton memoId={memoId} isPinned={isPinned} />
    </div>
  );
}
