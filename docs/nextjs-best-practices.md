# Next.js App Router ベストプラクティス

本ドキュメントは、Next.js App Routerを使用した開発におけるベストプラクティスを定義します。
**実装時は必ずこのガイドラインに従ってください。**

---

## 1. プロジェクト構成

### 1.1 ディレクトリ構造

```
src/
├── app/                    # App Router（ルーティング）
│   ├── (routes)/           # ルートグループ（URLに影響しない）
│   ├── layout.tsx          # ルートレイアウト
│   ├── page.tsx            # トップページ
│   ├── loading.tsx         # ローディングUI
│   ├── error.tsx           # エラーUI
│   ├── not-found.tsx       # 404ページ
│   └── globals.css         # グローバルCSS
├── components/             # UIコンポーネント
│   ├── ui/                 # 汎用UIコンポーネント（Button, Input等）
│   └── features/           # 機能別コンポーネント
├── lib/                    # ユーティリティ・設定
│   ├── prisma.ts           # Prismaクライアント
│   ├── utils.ts            # ヘルパー関数
│   └── validations.ts      # Zodスキーマ
├── server/                 # サーバーサイド専用コード
│   ├── actions/            # Server Actions
│   └── data/               # データアクセス層（DAL）
├── hooks/                  # カスタムフック（Client用）
└── types/                  # 型定義
```

### 1.2 アンチパターン（避けるべき構成）

```
# NG: appディレクトリに全てを詰め込む
src/app/
├── components/      # NG: appの中にcomponents
├── utils/           # NG: appの中にutils
└── ...

# NG: 深すぎるネスト
src/components/features/dashboard/widgets/weather/current/small/index.tsx
```

---

## 2. Server Components vs Client Components

### 2.1 基本原則

| 原則 | 説明 |
|------|------|
| **デフォルトはServer** | `'use client'`を明示しない限りServer Component |
| **Client Componentsは末端に** | コンポーネントツリーの末端（リーフ）に配置 |
| **小さく単一目的に** | 1コンポーネント = 1責務 |

### 2.2 Server Componentを使う場面

```tsx
// Server Component（デフォルト）
// ファイル先頭に 'use client' がない = Server Component

export default async function MemoList() {
  // データベースから直接データ取得可能
  const memos = await prisma.memo.findMany();

  return (
    <ul>
      {memos.map(memo => (
        <MemoCard key={memo.id} memo={memo} />
      ))}
    </ul>
  );
}
```

**Server Componentが適している場合:**
- データベース/APIからのデータ取得
- APIキーや機密情報へのアクセス
- 静的コンテンツのレンダリング
- SEOが重要なコンテンツ

### 2.3 Client Componentを使う場面

```tsx
'use client';

import { useState } from 'react';

export function SearchBar() {
  const [query, setQuery] = useState('');

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="検索..."
    />
  );
}
```

**Client Componentが必要な場合:**
- `useState`, `useEffect`, `useRef` などのフック使用
- `onClick`, `onChange` などのイベントハンドラ
- ブラウザAPI（`window`, `localStorage`等）へのアクセス
- リアルタイム更新が必要なUI

### 2.4 コンポジションパターン

```tsx
// Server Component
import { ClientInteractiveButton } from './ClientInteractiveButton';

export default async function MemoDetail({ id }: { id: string }) {
  const memo = await getMemo(id);  // サーバーでデータ取得

  return (
    <article>
      <h1>{memo.title}</h1>
      <div>{memo.content}</div>
      {/* Client Componentを子として配置 */}
      <ClientInteractiveButton memoId={memo.id} />
    </article>
  );
}
```

```tsx
'use client';

// Client Component（末端に配置）
export function ClientInteractiveButton({ memoId }: { memoId: string }) {
  const handleClick = () => {
    // インタラクティブな処理
  };

  return <button onClick={handleClick}>お気に入り</button>;
}
```

### 2.5 `'use client'` の配置ルール

```tsx
// 正しい: ファイルの先頭に配置
'use client';

import { useState } from 'react';
// ...

// 誤り: import後に配置
import { useState } from 'react';
'use client';  // エラー
```

**重要:** `'use client'`を付けたファイルからimportされる全てのモジュールはクライアントバンドルに含まれる。

---

## 3. データ取得

### 3.1 推奨アプローチ: Data Access Layer (DAL)

```
src/server/
├── actions/           # Server Actions（mutations）
│   └── memo.ts
└── data/              # Data Access Layer（queries）
    └── memo.ts
```

### 3.2 Data Access Layer の実装

```tsx
// src/server/data/memo.ts
import 'server-only';  // クライアントからのimportを防止
import { prisma } from '@/lib/prisma';
import { cache } from 'react';

// React cacheでリクエスト内の重複を排除
export const getMemos = cache(async (options?: {
  search?: string;
  tagId?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}) => {
  return prisma.memo.findMany({
    where: {
      ...(options?.search && {
        OR: [
          { title: { contains: options.search, mode: 'insensitive' } },
          { content: { contains: options.search, mode: 'insensitive' } },
        ],
      }),
      ...(options?.tagId && {
        tags: { some: { tagId: options.tagId } },
      }),
    },
    orderBy: {
      [options?.sort || 'updatedAt']: options?.order || 'desc',
    },
    include: { tags: { include: { tag: true } } },
  });
});

export const getMemo = cache(async (id: string) => {
  return prisma.memo.findUnique({
    where: { id },
    include: { tags: { include: { tag: true } } },
  });
});
```

### 3.3 Server Componentでのデータ取得

```tsx
// src/app/page.tsx
import { getMemos } from '@/server/data/memo';
import { MemoList } from '@/components/features/memo/MemoList';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; tag?: string }>;
}) {
  const params = await searchParams;
  const memos = await getMemos({
    search: params.search,
    tagId: params.tag,
  });

  return <MemoList memos={memos} />;
}
```

---

## 4. Server Actions

### 4.1 基本構造

```tsx
// src/server/actions/memo.ts
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { createMemoSchema } from '@/lib/validations';

export async function createMemo(formData: FormData) {
  // 1. バリデーション
  const validatedFields = createMemoSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // 2. データベース操作
  try {
    const memo = await prisma.memo.create({
      data: validatedFields.data,
    });

    // 3. キャッシュの再検証
    revalidatePath('/');

    return { success: true, data: memo };
  } catch (error) {
    return { success: false, error: 'メモの作成に失敗しました' };
  }
}
```

### 4.2 Server Actionsの使用（フォーム）

```tsx
// Client Component
'use client';

import { useActionState } from 'react';
import { createMemo } from '@/server/actions/memo';

export function MemoForm() {
  const [state, formAction, isPending] = useActionState(createMemo, null);

  return (
    <form action={formAction}>
      <input name="title" required />
      {state?.errors?.title && <p>{state.errors.title}</p>}

      <textarea name="content" />

      <button type="submit" disabled={isPending}>
        {isPending ? '保存中...' : '保存'}
      </button>
    </form>
  );
}
```

### 4.3 Server Actionsの使用（イベントハンドラ）

```tsx
'use client';

import { togglePin } from '@/server/actions/memo';
import { useTransition } from 'react';

export function PinButton({ memoId, isPinned }: { memoId: string; isPinned: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      await togglePin(memoId);
    });
  };

  return (
    <button onClick={handleClick} disabled={isPending}>
      {isPinned ? '★' : '☆'}
    </button>
  );
}
```

### 4.4 Server Actions セキュリティ

```tsx
'use server';

// Server Actionsは公開HTTPエンドポイントとして扱う
// 必要に応じて認証・認可チェックを行う

export async function deleteMemo(id: string) {
  // 入力のバリデーション
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid memo ID');
  }

  // 認証チェック（認証機能がある場合）
  // const session = await getSession();
  // if (!session) throw new Error('Unauthorized');

  await prisma.memo.delete({ where: { id } });
  revalidatePath('/');
}
```

---

## 5. ルーティング

### 5.1 ファイル規約

| ファイル | 用途 |
|----------|------|
| `page.tsx` | ルートのUI |
| `layout.tsx` | 共有レイアウト |
| `loading.tsx` | ローディングUI（Suspense） |
| `error.tsx` | エラーバウンダリ |
| `not-found.tsx` | 404ページ |
| `route.ts` | API Route Handler |

### 5.2 動的ルート

```
app/
├── memo/
│   ├── [id]/           # 動的セグメント
│   │   ├── page.tsx    # /memo/123
│   │   └── edit/
│   │       └── page.tsx # /memo/123/edit
│   └── new/
│       └── page.tsx    # /memo/new
```

```tsx
// app/memo/[id]/page.tsx
export default async function MemoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const memo = await getMemo(id);

  if (!memo) {
    notFound();
  }

  return <MemoDetail memo={memo} />;
}
```

### 5.3 レイアウトの活用

```tsx
// app/layout.tsx（ルートレイアウト）
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
```

### 5.4 ルートグループ

```
app/
├── (main)/             # URLに影響しないグループ
│   ├── layout.tsx      # (main)配下の共通レイアウト
│   ├── page.tsx        # /
│   └── memo/
│       └── [id]/
│           └── page.tsx
└── (auth)/             # 認証関連（将来用）
    └── layout.tsx
```

---

## 6. エラーハンドリング

### 6.1 error.tsx

```tsx
// app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-4 text-center">
      <h2>エラーが発生しました</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>再試行</button>
    </div>
  );
}
```

### 6.2 not-found.tsx

```tsx
// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="p-4 text-center">
      <h2>ページが見つかりません</h2>
      <Link href="/">ホームに戻る</Link>
    </div>
  );
}
```

---

## 7. ローディング状態

### 7.1 loading.tsx（Suspense境界）

```tsx
// app/loading.tsx
export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
      <div className="h-4 bg-gray-200 rounded w-full mb-2" />
      <div className="h-4 bg-gray-200 rounded w-3/4" />
    </div>
  );
}
```

### 7.2 Suspenseによる部分的ローディング

```tsx
import { Suspense } from 'react';

export default function Page() {
  return (
    <div>
      <h1>メモ一覧</h1>
      <Suspense fallback={<MemoListSkeleton />}>
        <MemoList />
      </Suspense>
    </div>
  );
}
```

---

## 8. キャッシュと再検証

### 8.1 Next.js 15のキャッシュ動作

```tsx
// Next.js 15以降: fetchはデフォルトでキャッシュされない
// 明示的にキャッシュを有効化
fetch('https://api.example.com/data', {
  cache: 'force-cache',  // キャッシュを強制
});

// または時間ベースの再検証
fetch('https://api.example.com/data', {
  next: { revalidate: 3600 },  // 1時間
});
```

### 8.2 revalidatePath / revalidateTag

```tsx
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

export async function updateMemo(id: string, data: MemoData) {
  await prisma.memo.update({ where: { id }, data });

  // パスベースの再検証
  revalidatePath('/');
  revalidatePath(`/memo/${id}`);

  // または、タグベースの再検証
  // revalidateTag('memos');
}
```

---

## 9. メタデータ

### 9.1 静的メタデータ

```tsx
// app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Memo App',
    template: '%s | Memo App',
  },
  description: 'シンプルなメモ帳アプリ',
};
```

### 9.2 動的メタデータ

```tsx
// app/memo/[id]/page.tsx
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const memo = await getMemo(id);

  return {
    title: memo?.title || 'メモが見つかりません',
  };
}
```

---

## 10. パフォーマンス最適化

### 10.1 画像最適化

```tsx
import Image from 'next/image';

// next/image を使用
<Image
  src="/hero.png"
  alt="Hero"
  width={800}
  height={400}
  priority  // LCP画像にはpriorityを付与
/>
```

### 10.2 フォント最適化

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="ja" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

### 10.3 動的インポート

```tsx
import dynamic from 'next/dynamic';

// 重いコンポーネントを遅延ロード
const MarkdownEditor = dynamic(
  () => import('@/components/features/memo/MarkdownEditor'),
  {
    loading: () => <p>エディタを読み込み中...</p>,
    ssr: false,  // クライアントのみでレンダリング
  }
);
```

---

## 11. 型安全性

### 11.1 Zodによるバリデーション

```tsx
// src/lib/validations.ts
import { z } from 'zod';

export const createMemoSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルは必須です')
    .max(255, 'タイトルは255文字以内です'),
  content: z.string().default(''),
  isPinned: z.boolean().default(false),
  tagIds: z.array(z.string()).default([]),
});

export type CreateMemoInput = z.infer<typeof createMemoSchema>;
```

### 11.2 Prisma型の活用

```tsx
import type { Memo, Tag } from '@prisma/client';

// Prismaが生成する型を活用
type MemoWithTags = Memo & {
  tags: { tag: Tag }[];
};
```

---

## 12. 本プロジェクトでの適用

### 12.1 採用する構成

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # メモ一覧
│   ├── loading.tsx
│   ├── error.tsx
│   ├── not-found.tsx
│   └── memo/
│       ├── new/page.tsx      # 新規作成
│       └── [id]/
│           ├── page.tsx      # 詳細
│           └── edit/page.tsx # 編集
├── components/
│   ├── ui/                   # Button, Input等
│   └── features/
│       ├── memo/             # メモ関連
│       └── tag/              # タグ関連
├── server/
│   ├── actions/
│   │   ├── memo.ts           # 'use server'
│   │   └── tag.ts
│   └── data/
│       ├── memo.ts           # import 'server-only'
│       └── tag.ts
├── lib/
│   ├── prisma.ts
│   ├── utils.ts
│   └── validations.ts
├── hooks/
│   └── useDebounce.ts
└── types/
    └── index.ts
```

### 12.2 コンポーネント分類

| コンポーネント | 種類 | 理由 |
|----------------|------|------|
| MemoList | Server | データ取得が主目的 |
| MemoCard | Server | 静的な表示のみ |
| MemoForm | Client | フォーム入力・状態管理 |
| MemoEditor | Client | テキスト入力・状態管理 |
| SearchBar | Client | リアルタイム入力 |
| PinButton | Client | onClick イベント |
| TagSelector | Client | 選択状態の管理 |
| Sidebar | Server | 静的な表示（タグ一覧はServer取得） |
| TagList | Server | データ取得が主目的 |

---

## 参考リンク

- [Next.js App Router Guides](https://nextjs.org/docs/app/guides)
- [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Server Actions and Mutations](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Data Security in Next.js](https://nextjs.org/docs/app/guides/data-security)

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-01-12 | 初版作成 |
