import Link from 'next/link';
import { Card, Badge } from '@/components/ui';
import { MemoCardActions } from './MemoCardActions';
import { formatDate, truncate } from '@/lib/utils';
import type { MemoWithTags } from '@/types';

interface MemoCardProps {
  memo: MemoWithTags;
}

export function MemoCard({ memo }: MemoCardProps) {
  return (
    <Card
      className="group relative transition-shadow hover:shadow-md"
      padding="none"
    >
      <Link href={`/memo/${memo.id}`} className="block p-4">
        {/* Header */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900">
            {memo.isPinned && (
              <span className="text-yellow-500" title="ピン留め">
                📌
              </span>
            )}
            <span className="line-clamp-1">{memo.title}</span>
          </h3>
        </div>

        {/* Content Preview */}
        {memo.content && (
          <p className="mb-3 line-clamp-2 text-sm text-gray-600">
            {truncate(memo.content, 100)}
          </p>
        )}

        {/* Tags */}
        {memo.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {memo.tags.slice(0, 3).map(({ tag }) => (
              <Badge key={tag.id} size="sm" color={tag.color || undefined}>
                {tag.name}
              </Badge>
            ))}
            {memo.tags.length > 3 && (
              <Badge size="sm" variant="default">
                +{memo.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <p className="text-xs text-gray-400">
          {formatDate(memo.updatedAt)}
        </p>
      </Link>

      {/* Action Buttons (Client Component) */}
      <MemoCardActions memoId={memo.id} isPinned={memo.isPinned} />
    </Card>
  );
}
