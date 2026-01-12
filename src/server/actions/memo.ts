'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { createMemoSchema, updateMemoSchema } from '@/lib/validations';
import type { ActionResult, MemoWithTags } from '@/types';

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

// メモ削除
export async function deleteMemo(id: string): Promise<ActionResult> {
  if (!id || typeof id !== 'string') {
    return { success: false, error: '無効なメモIDです' };
  }

  try {
    await prisma.memo.delete({
      where: { id },
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete memo:', error);
    return { success: false, error: 'メモの削除に失敗しました' };
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
