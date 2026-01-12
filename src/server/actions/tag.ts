'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { createTagSchema, updateTagSchema } from '@/lib/validations';
import type { ActionResult } from '@/types';
import type { Tag } from '@prisma/client';

// タグ作成
export async function createTag(
  formData: FormData
): Promise<ActionResult<Tag>> {
  const rawData = {
    name: formData.get('name'),
    color: formData.get('color') || undefined,
  };

  const validatedFields = createTagSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    // 同名タグの存在チェック
    const existing = await prisma.tag.findUnique({
      where: { name: validatedFields.data.name },
    });

    if (existing) {
      return {
        success: false,
        errors: { name: ['このタグ名は既に使用されています'] },
      };
    }

    const tag = await prisma.tag.create({
      data: validatedFields.data,
    });

    revalidatePath('/');
    return { success: true, data: tag };
  } catch (error) {
    console.error('Failed to create tag:', error);
    return { success: false, error: 'タグの作成に失敗しました' };
  }
}

// タグ更新
export async function updateTag(
  id: string,
  formData: FormData
): Promise<ActionResult<Tag>> {
  const rawData = {
    name: formData.get('name') || undefined,
    color: formData.get('color') || undefined,
  };

  const validatedFields = updateTagSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    // 同名タグの存在チェック（自分以外）
    if (validatedFields.data.name) {
      const existing = await prisma.tag.findFirst({
        where: {
          name: validatedFields.data.name,
          NOT: { id },
        },
      });

      if (existing) {
        return {
          success: false,
          errors: { name: ['このタグ名は既に使用されています'] },
        };
      }
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: validatedFields.data,
    });

    revalidatePath('/');
    return { success: true, data: tag };
  } catch (error) {
    console.error('Failed to update tag:', error);
    return { success: false, error: 'タグの更新に失敗しました' };
  }
}

// タグ削除
export async function deleteTag(id: string): Promise<ActionResult> {
  if (!id || typeof id !== 'string') {
    return { success: false, error: '無効なタグIDです' };
  }

  try {
    await prisma.tag.delete({
      where: { id },
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete tag:', error);
    return { success: false, error: 'タグの削除に失敗しました' };
  }
}
