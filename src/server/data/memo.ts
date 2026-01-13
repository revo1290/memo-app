import 'server-only';
import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import type { MemoSearchParams, MemoWithTags, PaginatedMemos } from '@/types';

// デフォルトのページサイズ
export const DEFAULT_PAGE_SIZE = 12;

// メモ一覧取得（キャッシュ付き、削除済みを除外、ページネーション対応）
export const getMemos = cache(
  async (params?: MemoSearchParams): Promise<MemoWithTags[]> => {
    const {
      search,
      tagId,
      sort = 'updatedAt',
      order = 'desc',
      page = 1,
      limit = DEFAULT_PAGE_SIZE,
    } = params || {};

    return prisma.memo.findMany({
      where: {
        deletedAt: null, // 削除済みを除外
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(tagId && {
          tags: { some: { tagId } },
        }),
      },
      orderBy: [
        { isPinned: 'desc' },
        { [sort]: order },
      ],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }
);

// メモ一覧取得（ページネーション情報付き）
export const getMemosWithPagination = cache(
  async (params?: MemoSearchParams): Promise<PaginatedMemos> => {
    const {
      search,
      tagId,
      sort = 'updatedAt',
      order = 'desc',
      page = 1,
      limit = DEFAULT_PAGE_SIZE,
    } = params || {};

    const where = {
      deletedAt: null,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { content: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(tagId && {
        tags: { some: { tagId } },
      }),
    };

    const [memos, total] = await Promise.all([
      prisma.memo.findMany({
        where,
        orderBy: [
          { isPinned: 'desc' },
          { [sort]: order },
        ],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
      }),
      prisma.memo.count({ where }),
    ]);

    return {
      memos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  }
);

// ゴミ箱のメモ一覧取得（キャッシュ付き）
export const getDeletedMemos = cache(
  async (): Promise<MemoWithTags[]> => {
    return prisma.memo.findMany({
      where: {
        deletedAt: { not: null },
      },
      orderBy: {
        deletedAt: 'desc',
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }
);

// メモ詳細取得（キャッシュ付き）
export const getMemo = cache(
  async (id: string, includeDeleted = false): Promise<MemoWithTags | null> => {
    return prisma.memo.findUnique({
      where: {
        id,
        ...(!includeDeleted && { deletedAt: null }),
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }
);

// ゴミ箱内のメモ数を取得
export const getDeletedMemosCount = cache(
  async (): Promise<number> => {
    return prisma.memo.count({
      where: { deletedAt: { not: null } },
    });
  }
);
