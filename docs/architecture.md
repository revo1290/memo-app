# システムアーキテクチャ設計書

## 1. 全体構成

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                 Next.js App Router                     │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  │  │
│  │  │   Pages     │  │    API      │  │   Server     │  │  │
│  │  │ (RSC/Client)│  │   Routes    │  │  Components  │  │  │
│  │  └─────────────┘  └─────────────┘  └──────────────┘  │  │
│  │         │                │                 │          │  │
│  │         └────────────────┼─────────────────┘          │  │
│  │                          │                            │  │
│  │                    ┌─────┴─────┐                      │  │
│  │                    │  Prisma   │                      │  │
│  │                    │   ORM     │                      │  │
│  │                    └─────┬─────┘                      │  │
│  └──────────────────────────┼────────────────────────────┘  │
│                             │                                │
│  ┌──────────────────────────┴────────────────────────────┐  │
│  │              Vercel Postgres (Neon)                    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 2. 技術スタック詳細

### 2.1 フロントエンド

| 技術 | バージョン | 用途 |
|------|------------|------|
| Next.js | 14.x | フレームワーク |
| React | 18.x | UIライブラリ |
| TypeScript | 5.x | 型安全性 |
| Tailwind CSS | 3.x | スタイリング |

### 2.2 バックエンド

| 技術 | 用途 |
|------|------|
| Next.js API Routes | REST API |
| Server Actions | フォーム処理・データ更新 |
| Prisma | ORM・マイグレーション |

### 2.3 外部ライブラリ

| ライブラリ | 用途 |
|------------|------|
| react-markdown | マークダウンレンダリング |
| remark-gfm | GFM（GitHub Flavored Markdown）対応 |
| react-syntax-highlighter | コードハイライト |
| lucide-react | アイコン |

## 3. ディレクトリ構成

```
memo-app/
├── docs/                      # ドキュメント
│   ├── requirements.md
│   ├── architecture.md
│   ├── database.md
│   ├── api.md
│   └── screens.md
├── prisma/
│   └── schema.prisma          # DBスキーマ定義
├── src/
│   ├── app/                   # App Router
│   │   ├── layout.tsx         # ルートレイアウト
│   │   ├── page.tsx           # トップページ（メモ一覧）
│   │   ├── globals.css        # グローバルCSS
│   │   ├── memo/
│   │   │   ├── new/
│   │   │   │   └── page.tsx   # 新規作成ページ
│   │   │   └── [id]/
│   │   │       ├── page.tsx   # メモ詳細ページ
│   │   │       └── edit/
│   │   │           └── page.tsx # 編集ページ
│   │   └── api/               # API Routes
│   │       ├── memos/
│   │       │   ├── route.ts   # GET(一覧), POST(作成)
│   │       │   └── [id]/
│   │       │       └── route.ts # GET, PUT, DELETE
│   │       └── tags/
│   │           ├── route.ts   # GET(一覧), POST(作成)
│   │           └── [id]/
│   │               └── route.ts # DELETE
│   ├── components/            # UIコンポーネント
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   ├── memo/
│   │   │   ├── MemoCard.tsx
│   │   │   ├── MemoList.tsx
│   │   │   ├── MemoForm.tsx
│   │   │   ├── MemoEditor.tsx
│   │   │   └── MemoPreview.tsx
│   │   ├── tag/
│   │   │   ├── TagBadge.tsx
│   │   │   ├── TagList.tsx
│   │   │   └── TagSelector.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── SearchBar.tsx
│   │       └── SortSelect.tsx
│   ├── lib/                   # ユーティリティ
│   │   ├── prisma.ts          # Prismaクライアント
│   │   └── utils.ts           # ヘルパー関数
│   ├── types/                 # 型定義
│   │   └── index.ts
│   └── hooks/                 # カスタムフック
│       └── useDebounce.ts
├── public/                    # 静的ファイル
├── .env.local                 # 環境変数（ローカル）
├── .env.example               # 環境変数テンプレート
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 4. レンダリング戦略

### 4.1 Server Components（デフォルト）
- メモ一覧ページ
- メモ詳細ページ
- タグ一覧

### 4.2 Client Components
- 検索バー（リアルタイム入力）
- マークダウンエディタ
- タグセレクター
- 並び替えセレクト
- お気に入りボタン

### 4.3 Server Actions
- メモの作成・更新・削除
- タグの作成・削除
- ピン留め切り替え

## 5. 状態管理

- **サーバー状態**: React Server Components + Server Actions
- **クライアント状態**: React useState/useReducer（ローカルUI状態のみ）
- **URL状態**: nuqs または searchParams（検索・フィルター・ソート）

## 6. セキュリティ考慮事項

| 項目 | 対策 |
|------|------|
| XSS | react-markdownでサニタイズ |
| SQLインジェクション | Prismaによるパラメータ化 |
| CSRF | Server Actionsの自動保護 |
| 入力バリデーション | Zodによるスキーマ検証 |

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-01-12 | 初版作成 |
