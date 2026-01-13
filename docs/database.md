# データベース設計書

## 1. 概要

- **データベース**: Vercel Postgres (PostgreSQL)
- **ORM**: Prisma
- **主キー形式**: CUID（衝突が少なく、URLセーフ）

## 2. ER図

```
┌─────────────────────┐       ┌─────────────────────┐
│        Memo         │       │         Tag         │
├─────────────────────┤       ├─────────────────────┤
│ id (PK)             │       │ id (PK)             │
│ title               │       │ name                │
│ content             │       │ color               │
│ isPinned            │       │ createdAt           │
│ deletedAt           │       └──────────┬──────────┘
│ createdAt           │                  │
│ updatedAt           │                  │
└──────────┬──────────┘                  │
           │                             │
           │    ┌─────────────────────┐  │
           │    │      MemoTag        │  │
           │    ├─────────────────────┤  │
           └───►│ memoId (FK)         │◄─┘
                │ tagId (FK)          │
                │ assignedAt          │
                └─────────────────────┘
```

## 3. テーブル定義

### 3.1 Memo（メモ）

| カラム名 | 型 | NULL | デフォルト | 説明 |
|----------|------|------|------------|------|
| id | String (CUID) | NO | cuid() | 主キー |
| title | String(255) | NO | - | タイトル |
| content | Text | NO | "" | 本文（Markdown） |
| isPinned | Boolean | NO | false | ピン留め状態 |
| deletedAt | DateTime | YES | null | 削除日時（論理削除用、nullなら未削除） |
| createdAt | DateTime | NO | now() | 作成日時 |
| updatedAt | DateTime | NO | @updatedAt | 更新日時 |

**インデックス**:
- `idx_memo_created_at` (createdAt DESC)
- `idx_memo_updated_at` (updatedAt DESC)
- `idx_memo_is_pinned` (isPinned)
- `idx_memo_deleted_at` (deletedAt)

### 3.2 Tag（タグ）

| カラム名 | 型 | NULL | デフォルト | 説明 |
|----------|------|------|------------|------|
| id | String (CUID) | NO | cuid() | 主キー |
| name | String(50) | NO | - | タグ名（ユニーク） |
| color | String(7) | YES | "#6B7280" | 色コード（HEX） |
| createdAt | DateTime | NO | now() | 作成日時 |

**インデックス**:
- `idx_tag_name` (name) UNIQUE

### 3.3 MemoTag（中間テーブル）

| カラム名 | 型 | NULL | デフォルト | 説明 |
|----------|------|------|------------|------|
| memoId | String | NO | - | メモID (FK) |
| tagId | String | NO | - | タグID (FK) |
| assignedAt | DateTime | NO | now() | 関連付け日時 |

**インデックス**:
- PRIMARY KEY (memoId, tagId)
- `idx_memo_tag_memo_id` (memoId)
- `idx_memo_tag_tag_id` (tagId)

## 4. Prismaスキーマ

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}

model Memo {
  id        String    @id @default(cuid())
  title     String    @db.VarChar(255)
  content   String    @default("") @db.Text
  isPinned  Boolean   @default(false)
  deletedAt DateTime? // 論理削除用（nullなら未削除）
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  tags      MemoTag[]

  @@index([createdAt(sort: Desc)])
  @@index([updatedAt(sort: Desc)])
  @@index([isPinned])
  @@index([deletedAt])
}

model Tag {
  id        String    @id @default(cuid())
  name      String    @unique @db.VarChar(50)
  color     String?   @default("#6B7280") @db.VarChar(7)
  createdAt DateTime  @default(now())
  memos     MemoTag[]

  @@index([name])
}

model MemoTag {
  memoId     String
  tagId      String
  assignedAt DateTime @default(now())
  memo       Memo     @relation(fields: [memoId], references: [id], onDelete: Cascade)
  tag        Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([memoId, tagId])
  @@index([memoId])
  @@index([tagId])
}
```

## 5. クエリパターン

### 5.1 メモ一覧取得（ピン留め優先、更新日降順）

```sql
SELECT m.*, array_agg(t.name) as tags
FROM "Memo" m
LEFT JOIN "MemoTag" mt ON m.id = mt."memoId"
LEFT JOIN "Tag" t ON mt."tagId" = t.id
GROUP BY m.id
ORDER BY m."isPinned" DESC, m."updatedAt" DESC;
```

### 5.2 キーワード検索

```sql
SELECT * FROM "Memo"
WHERE title ILIKE '%keyword%'
   OR content ILIKE '%keyword%'
ORDER BY "updatedAt" DESC;
```

### 5.3 タグでフィルター

```sql
SELECT m.* FROM "Memo" m
INNER JOIN "MemoTag" mt ON m.id = mt."memoId"
WHERE mt."tagId" = 'tag_id'
  AND m."deletedAt" IS NULL
ORDER BY m."updatedAt" DESC;
```

### 5.4 ゴミ箱のメモ一覧取得

```sql
SELECT * FROM "Memo"
WHERE "deletedAt" IS NOT NULL
ORDER BY "deletedAt" DESC;
```

### 5.5 メモの論理削除

```sql
UPDATE "Memo"
SET "deletedAt" = NOW()
WHERE id = 'memo_id';
```

### 5.6 メモの復元

```sql
UPDATE "Memo"
SET "deletedAt" = NULL
WHERE id = 'memo_id';
```

## 6. マイグレーション戦略

1. `prisma migrate dev` でローカル開発
2. `prisma migrate deploy` で本番デプロイ
3. Vercel のビルド時に自動実行

## 7. データ制約

| 項目 | 制約 |
|------|------|
| タイトル最大長 | 255文字 |
| タグ名最大長 | 50文字 |
| タグ名 | ユニーク制約 |
| 1メモあたりのタグ数 | 制限なし（推奨: 10以下） |

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-01-12 | 初版作成 |
| 2026-01-13 | 論理削除（deletedAt）カラム追加、ゴミ箱関連のクエリパターン追加 |
