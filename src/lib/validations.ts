import { z } from 'zod';

// メモ作成スキーマ
export const createMemoSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルは必須です')
    .max(255, 'タイトルは255文字以内です'),
  content: z.string().default(''),
  isPinned: z.boolean().default(false),
  tagIds: z.array(z.string()).default([]),
});

export type CreateMemoInput = z.infer<typeof createMemoSchema>;

// メモ更新スキーマ
export const updateMemoSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルは必須です')
    .max(255, 'タイトルは255文字以内です')
    .optional(),
  content: z.string().optional(),
  isPinned: z.boolean().optional(),
  tagIds: z.array(z.string()).optional(),
});

export type UpdateMemoInput = z.infer<typeof updateMemoSchema>;

// タグ作成スキーマ
export const createTagSchema = z.object({
  name: z
    .string()
    .min(1, 'タグ名は必須です')
    .max(50, 'タグ名は50文字以内です'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, '無効な色コードです')
    .optional()
    .default('#6B7280'),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;

// タグ更新スキーマ
export const updateTagSchema = z.object({
  name: z
    .string()
    .min(1, 'タグ名は必須です')
    .max(50, 'タグ名は50文字以内です')
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, '無効な色コードです')
    .optional(),
});

export type UpdateTagInput = z.infer<typeof updateTagSchema>;
