'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { createMemoSchema, updateMemoSchema } from '@/lib/validations';
import type { ActionResult, MemoWithTags, MemoSearchParams, PaginatedMemos } from '@/types';
import { DEFAULT_PAGE_SIZE } from '@/server/data/memo';

// メモ作成
export async function createMemo(
  formData: FormData
): Promise<ActionResult<MemoWithTags>> {
  const rawData = {
    title: formData.get('title'),
    content: formData.get('content') || '',
    isPinned: formData.get('isPinned') === 'true',
    tagIds: formData.getAll('tagIds') as string[],
  };

  const validatedFields = createMemoSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const { tagIds, ...memoData } = validatedFields.data;

    const memo = await prisma.memo.create({
      data: {
        ...memoData,
        tags: {
          create: tagIds.map((tagId) => ({
            tag: { connect: { id: tagId } },
          })),
        },
      },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });

    revalidatePath('/');
    return { success: true, data: memo };
  } catch (error) {
    console.error('Failed to create memo:', error);
    return { success: false, error: 'メモの作成に失敗しました' };
  }
}

// メモ更新
export async function updateMemo(
  id: string,
  formData: FormData
): Promise<ActionResult<MemoWithTags>> {
  const rawData = {
    title: formData.get('title') || undefined,
    content: formData.get('content') || undefined,
    isPinned:
      formData.get('isPinned') !== null
        ? formData.get('isPinned') === 'true'
        : undefined,
    tagIds: formData.has('tagIds')
      ? (formData.getAll('tagIds') as string[])
      : undefined,
  };

  const validatedFields = updateMemoSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const { tagIds, ...memoData } = validatedFields.data;

    // タグの更新がある場合は一度削除して再作成
    if (tagIds !== undefined) {
      await prisma.memoTag.deleteMany({
        where: { memoId: id },
      });
    }

    const memo = await prisma.memo.update({
      where: { id },
      data: {
        ...memoData,
        ...(tagIds !== undefined && {
          tags: {
            create: tagIds.map((tagId) => ({
              tag: { connect: { id: tagId } },
            })),
          },
        }),
      },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });

    revalidatePath('/');
    revalidatePath(`/memo/${id}`);
    return { success: true, data: memo };
  } catch (error) {
    console.error('Failed to update memo:', error);
    return { success: false, error: 'メモの更新に失敗しました' };
  }
}

// メモ削除（論理削除）
export async function deleteMemo(id: string): Promise<ActionResult> {
  if (!id || typeof id !== 'string') {
    return { success: false, error: '無効なメモIDです' };
  }

  try {
    await prisma.memo.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    revalidatePath('/');
    revalidatePath('/trash');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete memo:', error);
    return { success: false, error: 'メモの削除に失敗しました' };
  }
}

// メモ復元
export async function restoreMemo(id: string): Promise<ActionResult> {
  if (!id || typeof id !== 'string') {
    return { success: false, error: '無効なメモIDです' };
  }

  try {
    await prisma.memo.update({
      where: { id },
      data: { deletedAt: null },
    });

    revalidatePath('/');
    revalidatePath('/trash');
    return { success: true };
  } catch (error) {
    console.error('Failed to restore memo:', error);
    return { success: false, error: 'メモの復元に失敗しました' };
  }
}

// メモ完全削除
export async function permanentlyDeleteMemo(id: string): Promise<ActionResult> {
  if (!id || typeof id !== 'string') {
    return { success: false, error: '無効なメモIDです' };
  }

  try {
    await prisma.memo.delete({
      where: { id },
    });

    revalidatePath('/trash');
    return { success: true };
  } catch (error) {
    console.error('Failed to permanently delete memo:', error);
    return { success: false, error: 'メモの完全削除に失敗しました' };
  }
}

// ゴミ箱を空にする
export async function emptyTrash(): Promise<ActionResult> {
  try {
    await prisma.memo.deleteMany({
      where: { deletedAt: { not: null } },
    });

    revalidatePath('/trash');
    return { success: true };
  } catch (error) {
    console.error('Failed to empty trash:', error);
    return { success: false, error: 'ゴミ箱を空にできませんでした' };
  }
}

// ピン留めトグル
export async function togglePin(id: string): Promise<ActionResult<{ isPinned: boolean }>> {
  if (!id || typeof id !== 'string') {
    return { success: false, error: '無効なメモIDです' };
  }

  try {
    const memo = await prisma.memo.findUnique({
      where: { id },
      select: { isPinned: true },
    });

    if (!memo) {
      return { success: false, error: 'メモが見つかりません' };
    }

    const updated = await prisma.memo.update({
      where: { id },
      data: { isPinned: !memo.isPinned },
      select: { isPinned: true },
    });

    revalidatePath('/');
    revalidatePath(`/memo/${id}`);
    return { success: true, data: updated };
  } catch (error) {
    console.error('Failed to toggle pin:', error);
    return { success: false, error: 'ピン留めの切り替えに失敗しました' };
  }
}

// 追加メモ取得（無限スクロール用、キャッシュなし）
export async function fetchMoreMemos(
  params: MemoSearchParams
): Promise<ActionResult<PaginatedMemos>> {
  const {
    search,
    tagId,
    sort = 'updatedAt',
    order = 'desc',
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
  } = params;

  try {
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
      success: true,
      data: {
        memos,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: page * limit < total,
        },
      },
    };
  } catch (error) {
    console.error('Failed to fetch more memos:', error);
    return { success: false, error: 'メモの取得に失敗しました' };
  }
}
