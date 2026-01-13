import { Suspense } from 'react';
import { Trash2 } from 'lucide-react';

// 動的レンダリングを強制（DB接続が必要）
export const dynamic = 'force-dynamic';

import { Header, Sidebar } from '@/components/layout';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { TrashMemoList } from '@/components/features/trash/TrashMemoList';
import { EmptyTrashButton } from '@/components/features/trash/EmptyTrashButton';
import { MemoListSkeleton, EmptyState } from '@/components/ui';
import { getDeletedMemos } from '@/server/data/memo';
import { getTags } from '@/server/data/tag';

export default async function TrashPage() {
  const tags = await getTags();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <Sidebar isTrashPage />

        {/* Mobile Sidebar */}
        <MobileSidebar tags={tags} />

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <Trash2 className="h-6 w-6" />
              ゴミ箱
            </h1>
            <Suspense fallback={null}>
              <EmptyTrashButtonContainer />
            </Suspense>
          </div>

          {/* Trash Memo List */}
          <Suspense fallback={<MemoListSkeleton />}>
            <TrashMemoListContainer />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

// Server Component for Empty Trash Button
async function EmptyTrashButtonContainer() {
  const memos = await getDeletedMemos();

  if (memos.length === 0) {
    return null;
  }

  return <EmptyTrashButton count={memos.length} />;
}

// Server Component for Trash Memo List
async function TrashMemoListContainer() {
  const memos = await getDeletedMemos();

  if (memos.length === 0) {
    return (
      <EmptyState
        icon={<Trash2 className="h-12 w-12" />}
        title="ゴミ箱は空です"
        description="削除されたメモはここに表示されます"
      />
    );
  }

  return <TrashMemoList memos={memos} />;
}
