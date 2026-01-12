import { FileText } from 'lucide-react';
import { MemoCard } from './MemoCard';
import { EmptyState, Button } from '@/components/ui';
import Link from 'next/link';
import type { MemoWithTags } from '@/types';

interface MemoListProps {
  memos: MemoWithTags[];
  emptyMessage?: string;
}

export function MemoList({
  memos,
  emptyMessage = 'メモがありません',
}: MemoListProps) {
  if (memos.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="h-12 w-12" />}
        title={emptyMessage}
        description="新しいメモを作成してみましょう"
        action={
          <Button asChild>
            <Link href="/memo/new">メモを作成</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {memos.map((memo) => (
        <MemoCard key={memo.id} memo={memo} />
      ))}
    </div>
  );
}
