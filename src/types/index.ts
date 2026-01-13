import type { Memo, Tag, MemoTag } from '@prisma/client';

// メモ（タグ付き）
export type MemoWithTags = Memo & {
  tags: (MemoTag & {
    tag: Tag;
  })[];
};

// タグ（メモ数付き）
export type TagWithCount = Tag & {
  _count?: {
    memos: number;
  };
};

// ソートオプション
export type SortOption = 'updatedAt' | 'createdAt' | 'title';
export type SortOrder = 'asc' | 'desc';

// 検索パラメータ
export type MemoSearchParams = {
  search?: string;
  tagId?: string;
  sort?: SortOption;
  order?: SortOrder;
  page?: number;
  limit?: number;
};

// アクション結果
export type ActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
};

// ページネーション情報
export type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};

// ページネーション付きメモ一覧
export type PaginatedMemos = {
  memos: MemoWithTags[];
  pagination: PaginationInfo;
};
