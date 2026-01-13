import Link from 'next/link';
import { Suspense } from 'react';
import { FileText, Tag, Trash2 } from 'lucide-react';
import { getTags } from '@/server/data/tag';
import { getDeletedMemosCount } from '@/server/data/memo';
import { SidebarSkeleton } from '@/components/ui';
import { TagCreateButton } from '@/components/features/tag/TagCreateButton';
import { TagListItem } from '@/components/features/tag/TagListItem';

interface SidebarProps {
  activeTagId?: string;
  isTrashPage?: boolean;
}

export function Sidebar({ activeTagId, isTrashPage }: SidebarProps) {
  return (
    <aside className="hidden w-64 flex-shrink-0 border-r border-gray-200 bg-gray-50 lg:block">
      <nav className="flex h-full flex-col p-4">
        {/* All Memos */}
        <Link
          href="/"
          className={`mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            !activeTagId && !isTrashPage
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <FileText className="h-4 w-4" />
          すべてのメモ
        </Link>

        {/* Trash */}
        <Suspense fallback={null}>
          <TrashLink isActive={isTrashPage} />
        </Suspense>

        {/* Divider */}
        <div className="my-4 border-t border-gray-200" />

        {/* Tags Section */}
        <div className="flex items-center justify-between px-3 py-2">
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <Tag className="h-3 w-3" />
            タグ
          </span>
          <TagCreateButton />
        </div>

        {/* Tag List */}
        <Suspense fallback={<SidebarSkeleton />}>
          <TagList activeTagId={activeTagId} />
        </Suspense>
      </nav>
    </aside>
  );
}

// Server Component for Tag List
async function TagList({ activeTagId }: { activeTagId?: string }) {
  const tags = await getTags();

  if (tags.length === 0) {
    return (
      <p className="px-3 py-2 text-sm text-gray-500">
        タグがありません
      </p>
    );
  }

  return (
    <ul className="flex-1 space-y-1 overflow-y-auto">
      {tags.map((tag) => (
        <TagListItem key={tag.id} tag={tag} isActive={activeTagId === tag.id} />
      ))}
    </ul>
  );
}

// Server Component for Trash Link
async function TrashLink({ isActive }: { isActive?: boolean }) {
  const count = await getDeletedMemosCount();

  return (
    <Link
      href="/trash"
      className={`mb-2 flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span className="flex items-center gap-2">
        <Trash2 className="h-4 w-4" />
        ゴミ箱
      </span>
      {count > 0 && (
        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">
          {count}
        </span>
      )}
    </Link>
  );
}
