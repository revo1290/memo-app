import 'server-only';
import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import type { MemoSearchParams, MemoWithTags } from '@/types';

// メモ一覧取得（キャッシュ付き）
export const getMemos = cache(
  async (params?: MemoSearchParams): Promise<MemoWithTags[]> => {
    const {
      search,
      tagId,
      sort = 'updatedAt',
      order = 'desc',
    } = params || {};

    return prisma.memo.findMany({
      where: {
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
  async (id: string): Promise<MemoWithTags | null> => {
    return prisma.memo.findUnique({
      where: { id },
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
