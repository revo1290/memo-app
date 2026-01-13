# API設計書

## 1. 概要

- **ベースURL**: `/api`
- **データ形式**: JSON
- **文字コード**: UTF-8

## 2. 共通仕様

### 2.1 レスポンス形式

**成功時**:
```json
{
  "data": { ... },
  "message": "Success"
}
```

**エラー時**:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ"
  }
}
```

### 2.2 HTTPステータスコード

| コード | 説明 |
|--------|------|
| 200 | 成功（GET, PUT） |
| 201 | 作成成功（POST） |
| 204 | 削除成功（DELETE） |
| 400 | バリデーションエラー |
| 404 | リソースが見つからない |
| 500 | サーバーエラー |

---

## 3. Memo API

### 3.1 メモ一覧取得

```
GET /api/memos
```

**クエリパラメータ**:

| パラメータ | 型 | 必須 | デフォルト | 説明 |
|------------|------|------|------------|------|
| search | string | No | - | 検索キーワード |
| tag | string | No | - | タグID（フィルター） |
| sort | string | No | updatedAt | ソート項目 |
| order | string | No | desc | asc / desc |
| page | number | No | 1 | ページ番号 |
| limit | number | No | 20 | 取得件数（最大100） |

**レスポンス例**:
```json
{
  "data": {
    "memos": [
      {
        "id": "clx1234567890",
        "title": "買い物リスト",
        "content": "- 牛乳\n- パン",
        "isPinned": true,
        "createdAt": "2026-01-12T10:00:00.000Z",
        "updatedAt": "2026-01-12T10:30:00.000Z",
        "tags": [
          { "id": "clx0987654321", "name": "生活", "color": "#10B981" }
        ]
      }
    ],
    "pagination": {
      "total": 42,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  }
}
```

---

### 3.2 メモ詳細取得

```
GET /api/memos/:id
```

**パスパラメータ**:

| パラメータ | 型 | 説明 |
|------------|------|------|
| id | string | メモID |

**レスポンス例**:
```json
{
  "data": {
    "id": "clx1234567890",
    "title": "買い物リスト",
    "content": "- 牛乳\n- パン\n- 卵",
    "isPinned": true,
    "createdAt": "2026-01-12T10:00:00.000Z",
    "updatedAt": "2026-01-12T10:30:00.000Z",
    "tags": [
      { "id": "clx0987654321", "name": "生活", "color": "#10B981" }
    ]
  }
}
```

---

### 3.3 メモ作成

```
POST /api/memos
```

**リクエストボディ**:
```json
{
  "title": "新しいメモ",
  "content": "メモの内容",
  "isPinned": false,
  "tagIds": ["clx0987654321"]
}
```

| フィールド | 型 | 必須 | 説明 |
|------------|------|------|------|
| title | string | Yes | タイトル（1-255文字） |
| content | string | No | 本文 |
| isPinned | boolean | No | ピン留め（デフォルト: false） |
| tagIds | string[] | No | タグIDの配列 |

**レスポンス**: 201 Created + 作成されたメモ

---

### 3.4 メモ更新

```
PUT /api/memos/:id
```

**リクエストボディ**:
```json
{
  "title": "更新後のタイトル",
  "content": "更新後の内容",
  "isPinned": true,
  "tagIds": ["clx0987654321", "clx1111111111"]
}
```

| フィールド | 型 | 必須 | 説明 |
|------------|------|------|------|
| title | string | No | タイトル |
| content | string | No | 本文 |
| isPinned | boolean | No | ピン留め |
| tagIds | string[] | No | タグID（全置換） |

**レスポンス**: 200 OK + 更新されたメモ

---

### 3.5 メモ削除（論理削除）

```
DELETE /api/memos/:id
```

メモを論理削除（ゴミ箱へ移動）します。

**レスポンス**: 204 No Content

---

### 3.6 ゴミ箱のメモ一覧取得

```
GET /api/memos/trash
```

**レスポンス例**:
```json
{
  "data": {
    "memos": [
      {
        "id": "clx1234567890",
        "title": "削除されたメモ",
        "content": "...",
        "deletedAt": "2026-01-13T10:00:00.000Z",
        ...
      }
    ]
  }
}
```

---

### 3.7 メモ復元

```
POST /api/memos/:id/restore
```

ゴミ箱からメモを復元します。

**レスポンス**: 200 OK + 復元されたメモ

---

### 3.8 メモ完全削除

```
DELETE /api/memos/:id/permanent
```

メモをデータベースから完全に削除します（復元不可）。

**レスポンス**: 204 No Content

---

### 3.9 ゴミ箱を空にする

```
DELETE /api/memos/trash
```

ゴミ箱内のすべてのメモを完全に削除します。

**レスポンス**: 204 No Content

---

### 3.10 ピン留めトグル

```
PATCH /api/memos/:id/pin
```

**レスポンス**:
```json
{
  "data": {
    "id": "clx1234567890",
    "isPinned": true
  }
}
```

---

## 4. Tag API

### 4.1 タグ一覧取得

```
GET /api/tags
```

**レスポンス例**:
```json
{
  "data": {
    "tags": [
      { "id": "clx0987654321", "name": "仕事", "color": "#3B82F6", "memoCount": 15 },
      { "id": "clx1111111111", "name": "プライベート", "color": "#10B981", "memoCount": 8 }
    ]
  }
}
```

---

### 4.2 タグ作成

```
POST /api/tags
```

**リクエストボディ**:
```json
{
  "name": "新しいタグ",
  "color": "#8B5CF6"
}
```

| フィールド | 型 | 必須 | 説明 |
|------------|------|------|------|
| name | string | Yes | タグ名（1-50文字、ユニーク） |
| color | string | No | 色コード（デフォルト: #6B7280） |

**レスポンス**: 201 Created + 作成されたタグ

---

### 4.3 タグ更新

```
PUT /api/tags/:id
```

**リクエストボディ**:
```json
{
  "name": "更新後のタグ名",
  "color": "#EC4899"
}
```

**レスポンス**: 200 OK + 更新されたタグ

---

### 4.4 タグ削除

```
DELETE /api/tags/:id
```

**レスポンス**: 204 No Content

※ タグを削除しても、関連するメモは削除されない（中間テーブルのみ削除）

---

## 5. Server Actions（実装済み）

このアプリではAPI Routesの代わりにServer Actionsを使用:

```typescript
// src/server/actions/memo.ts
'use server'

// メモCRUD
export async function createMemo(formData: FormData) { ... }
export async function updateMemo(id: string, formData: FormData) { ... }
export async function deleteMemo(id: string) { ... }  // 論理削除
export async function togglePin(id: string) { ... }

// ゴミ箱機能
export async function restoreMemo(id: string) { ... }
export async function permanentlyDeleteMemo(id: string) { ... }
export async function emptyTrash() { ... }

// 無限スクロール用
export async function fetchMoreMemos(params: MemoSearchParams) { ... }

// src/server/actions/tag.ts
'use server'

export async function createTag(formData: FormData) { ... }
export async function updateTag(id: string, formData: FormData) { ... }
export async function deleteTag(id: string) { ... }
```

---

## 6. バリデーションルール

### Zodスキーマ

```typescript
import { z } from 'zod';

export const createMemoSchema = z.object({
  title: z.string().min(1, '必須').max(255, '255文字以内'),
  content: z.string().default(''),
  isPinned: z.boolean().default(false),
  tagIds: z.array(z.string()).default([]),
});

export const createTagSchema = z.object({
  name: z.string().min(1, '必須').max(50, '50文字以内'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '無効な色コード').optional(),
});
```

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-01-12 | 初版作成 |
| 2026-01-13 | ゴミ箱関連API追加、Server Actionsの更新、タグ更新アクション追加 |
