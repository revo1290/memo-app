import type { Metadata } from 'next';

// 動的レンダリングを強制（DB接続が必要）
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Header } from '@/components/layout';
import { MemoForm } from '@/components/features/memo';
import { getMemo } from '@/server/data/memo';
import { getTags } from '@/server/data/tag';

interface EditMemoPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: EditMemoPageProps): Promise<Metadata> {
  const { id } = await params;
  const memo = await getMemo(id);

  if (!memo) {
    return { title: 'メモが見つかりません' };
  }

  return {
    title: `${memo.title} を編集`,
  };
}

export default async function EditMemoPage({ params }: EditMemoPageProps) {
  const { id } = await params;
  const [memo, tags] = await Promise.all([getMemo(id), getTags()]);

  if (!memo) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          {/* Back Link */}
          <Link
            href={`/memo/${memo.id}`}
            className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            戻る
          </Link>

          {/* Title */}
          <h1 className="mb-6 text-2xl font-bold text-gray-900">
            メモを編集
          </h1>

          {/* Form */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <MemoForm memo={memo} tags={tags} mode="edit" />
          </div>
        </div>
      </main>
    </div>
  );
}
