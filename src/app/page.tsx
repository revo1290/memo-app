import { Suspense } from 'react';

// 動的レンダリングを強制（DB接続が必要）
export const dynamic = 'force-dynamic';

import { Header, Sidebar } from '@/components/layout';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { MemoList } from '@/components/features/memo';
import { SortSelect, MemoListSkeleton } from '@/components/ui';
import { getMemos } from '@/server/data/memo';
import { getTags } from '@/server/data/tag';
import type { SortOption, SortOrder } from '@/types';

interface HomePageProps {
  searchParams: Promise<{
    search?: string;
    tag?: string;
    sort?: SortOption;
    order?: SortOrder;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const tags = await getTags();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <Sidebar activeTagId={params.tag} />

        {/* Mobile Sidebar */}
        <MobileSidebar tags={tags} activeTagId={params.tag} />

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Header with Sort */}
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {params.tag
                ? tags.find((t) => t.id === params.tag)?.name || 'タグ'
                : params.search
                  ? `「${params.search}」の検索結果`
                  : 'すべてのメモ'}
            </h1>
            <Suspense fallback={null}>
              <SortSelect />
            </Suspense>
          </div>

          {/* Memo List */}
          <Suspense fallback={<MemoListSkeleton />}>
            <MemoListContainer
              search={params.search}
              tagId={params.tag}
              sort={params.sort}
              order={params.order}
            />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

// Server Component for Memo List
async function MemoListContainer({
  search,
  tagId,
  sort,
  order,
}: {
  search?: string;
  tagId?: string;
  sort?: SortOption;
  order?: SortOrder;
}) {
  const memos = await getMemos({ search, tagId, sort, order });

  const emptyMessage = search
    ? `「${search}」に一致するメモが見つかりませんでした`
    : tagId
      ? 'このタグのメモがありません'
      : 'メモがありません';

  return <MemoList memos={memos} emptyMessage={emptyMessage} />;
}
