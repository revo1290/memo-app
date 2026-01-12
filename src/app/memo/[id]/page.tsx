import type { Metadata } from 'next';

// 動的レンダリングを強制（DB接続が必要）
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Pencil } from 'lucide-react';
import { Header } from '@/components/layout';
import { MemoPreview, PinButton, DeleteMemoButton } from '@/components/features/memo';
import { Badge, Button } from '@/components/ui';
import { getMemo } from '@/server/data/memo';
import { formatDate } from '@/lib/utils';

interface MemoDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: MemoDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const memo = await getMemo(id);

  if (!memo) {
    return { title: 'メモが見つかりません' };
  }

  return {
    title: memo.title,
  };
}

export default async function MemoDetailPage({ params }: MemoDetailPageProps) {
  const { id } = await params;
  const memo = await getMemo(id);

  if (!memo) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          {/* Navigation */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              戻る
            </Link>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/memo/${memo.id}/edit`}>
                  <Pencil className="h-4 w-4" />
                  編集
                </Link>
              </Button>
              <DeleteMemoButton memoId={memo.id} memoTitle={memo.title} />
            </div>
          </div>

          {/* Memo Content */}
          <article className="rounded-lg border border-gray-200 bg-white">
            {/* Header */}
            <div className="border-b border-gray-100 p-6">
              <div className="flex items-start justify-between gap-4">
                <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                  {memo.isPinned && <span title="ピン留め">📌</span>}
                  {memo.title}
                </h1>
                <PinButton memoId={memo.id} isPinned={memo.isPinned} size="md" />
              </div>

              {/* Tags */}
              {memo.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {memo.tags.map(({ tag }) => (
                    <Link key={tag.id} href={`/?tag=${tag.id}`}>
                      <Badge color={tag.color || undefined}>
                        {tag.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}

              {/* Meta */}
              <div className="mt-4 text-sm text-gray-500">
                <span>作成: {formatDate(memo.createdAt)}</span>
                <span className="mx-2">|</span>
                <span>更新: {formatDate(memo.updatedAt)}</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {memo.content ? (
                <MemoPreview content={memo.content} />
              ) : (
                <p className="italic text-gray-400">内容がありません</p>
              )}
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
