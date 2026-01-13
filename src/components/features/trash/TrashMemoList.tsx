import { TrashMemoCard } from './TrashMemoCard';
import type { MemoWithTags } from '@/types';

interface TrashMemoListProps {
  memos: MemoWithTags[];
}

export function TrashMemoList({ memos }: TrashMemoListProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {memos.map((memo) => (
        <TrashMemoCard key={memo.id} memo={memo} />
      ))}
    </div>
  );
}
