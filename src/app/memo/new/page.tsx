import type { Metadata } from 'next';

// 動的レンダリングを強制（DB接続が必要）
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Header } from '@/components/layout';
import { MemoForm } from '@/components/features/memo';
import { getTags } from '@/server/data/tag';

export const metadata: Metadata = {
  title: '新規メモ作成',
};

export default async function NewMemoPage() {
  const tags = await getTags();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          {/* Back Link */}
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            戻る
          </Link>

          {/* Title */}
          <h1 className="mb-6 text-2xl font-bold text-gray-900">
            新規メモ作成
          </h1>

          {/* Form */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <MemoForm tags={tags} mode="create" />
          </div>
        </div>
      </main>
    </div>
  );
}
