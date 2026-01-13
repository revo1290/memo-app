import { Suspense } from 'react';
import { FileText } from 'lucide-react';

// 動的レンダリングを強制（DB接続が必要）
export const dynamic = 'force-dynamic';

import { Header, Sidebar } from '@/components/layout';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { InfiniteScrollList } from '@/components/features/memo';
import { SortSelect, MemoListSkeleton, EmptyState, Button } from '@/components/ui';
import { getMemosWithPagination } from '@/server/data/memo';
import { getTags } from '@/server/data/tag';
import type { SortOption, SortOrder } from '@/types';
import Link from 'next/link';

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

// Server Component for Memo List with Infinite Scroll
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
  const searchParams = { search, tagId, sort, order };
  const { memos, pagination } = await getMemosWithPagination(searchParams);

  if (memos.length === 0) {
    const emptyMessage = search
      ? `「${search}」に一致するメモが見つかりませんでした`
      : tagId
        ? 'このタグのメモがありません'
        : 'メモがありません';

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
    <InfiniteScrollList
      initialMemos={memos}
      initialPagination={pagination}
      searchParams={searchParams}
    />
  );
}
