'use client';

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Input,
  Textarea,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui';
import { TagSelector } from '@/components/features/tag/TagSelector';
import { PinButton } from './PinButton';
import { MemoPreview } from './MemoPreview';
import { createMemo, updateMemo } from '@/server/actions/memo';
import type { MemoWithTags, TagWithCount, ActionResult } from '@/types';

interface MemoFormProps {
  memo?: MemoWithTags;
  tags: TagWithCount[];
  mode: 'create' | 'edit';
}

export function MemoForm({ memo, tags, mode }: MemoFormProps) {
  const router = useRouter();
  const [content, setContent] = useState(memo?.content || '');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    memo?.tags.map((t) => t.tagId) || []
  );

  // Server Action wrapper
  const formAction = async (
    _prevState: ActionResult<MemoWithTags> | null,
    formData: FormData
  ): Promise<ActionResult<MemoWithTags>> => {
    // タグIDsを追加
    selectedTagIds.forEach((id) => formData.append('tagIds', id));

    const result =
      mode === 'create'
        ? await createMemo(formData)
        : await updateMemo(memo!.id, formData);

    if (result.success && result.data) {
      router.push(`/memo/${result.data.id}`);
    }

    return result;
  };

  const [state, action, isPending] = useActionState(formAction, null);

  return (
    <form action={action} className="space-y-6">
      {/* Title */}
      <Input
        name="title"
        label="タイトル"
        placeholder="メモのタイトル"
        defaultValue={memo?.title}
        error={state?.errors?.title?.[0]}
        required
      />

      {/* Tags */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          タグ
        </label>
        <TagSelector
          tags={tags}
          selectedIds={selectedTagIds}
          onChange={setSelectedTagIds}
        />
      </div>

      {/* Content with Tabs */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          内容
        </label>
        <Tabs defaultValue="edit" className="w-full">
          <div className="mb-2 flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="edit">編集</TabsTrigger>
              <TabsTrigger value="preview">プレビュー</TabsTrigger>
            </TabsList>

            {/* Pin Toggle (Edit mode only) */}
            {mode === 'edit' && memo && (
              <PinButton memoId={memo.id} isPinned={memo.isPinned} size="md" />
            )}
          </div>

          <TabsContent value="edit">
            <Textarea
              name="content"
              placeholder="マークダウン記法が使えます..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[300px] font-mono"
              error={state?.errors?.content?.[0]}
            />
          </TabsContent>

          <TabsContent value="preview">
            <div className="min-h-[300px] rounded-lg border border-gray-300 bg-white p-4">
              <MemoPreview content={content} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Error Message */}
      {state?.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={isPending}
        >
          キャンセル
        </Button>
        <Button type="submit" isLoading={isPending}>
          {mode === 'create' ? '作成' : '保存'}
        </Button>
      </div>
    </form>
  );
}
