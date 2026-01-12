import 'server-only';
import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import type { TagWithCount } from '@/types';

// タグ一覧取得（メモ数付き、キャッシュ付き）
export const getTags = cache(async (): Promise<TagWithCount[]> => {
  return prisma.tag.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { memos: true },
      },
    },
  });
});

// タグ詳細取得（キャッシュ付き）
export const getTag = cache(async (id: string) => {
  return prisma.tag.findUnique({
    where: { id },
  });
});
