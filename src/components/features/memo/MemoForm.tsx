'use client';

import { useActionState, useState, useRef, useCallback } from 'react';
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
import { CharacterCounter } from './CharacterCounter';
import { MarkdownToolbar } from './MarkdownToolbar';
import { createMemo, updateMemo } from '@/server/actions/memo';
import type { MemoWithTags, TagWithCount, ActionResult } from '@/types';

interface MemoFormProps {
  memo?: MemoWithTags;
  tags: TagWithCount[];
  mode: 'create' | 'edit';
}

export function MemoForm({ memo, tags, mode }: MemoFormProps) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [content, setContent] = useState(memo?.content || '');
  const [title, setTitle] = useState(memo?.title || '');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    memo?.tags.map((t) => t.tagId) || []
  );

  // Handle image paste
  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          await uploadImage(file);
        }
        break;
      }
    }
  }, []);

  // Upload image to Vercel Blob
  const uploadImage = async (file: File) => {
    setIsUploading(true);
    try {
      const response = await fetch(
        `/api/upload?filename=${encodeURIComponent(file.name)}`,
        {
          method: 'POST',
          body: file,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'アップロードに失敗しました');
      }

      const blob = await response.json();
      insertImageMarkdown(blob.url, file.name);
    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : '画像のアップロードに失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  // Insert image markdown at cursor position
  const insertImageMarkdown = (url: string, alt: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const text = textarea.value;
    const imageMarkdown = `![${alt}](${url})`;
    const newText =
      text.substring(0, start) + imageMarkdown + text.substring(start);

    setContent(newText);

    setTimeout(() => {
      textarea.focus();
      const newPosition = start + imageMarkdown.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

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
        value={title}
        onChange={(e) => setTitle(e.target.value)}
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
            <MarkdownToolbar
              textareaRef={textareaRef}
              onContentChange={setContent}
            />
            <div className="relative">
              <Textarea
                ref={textareaRef}
                name="content"
                placeholder="マークダウン記法が使えます... (画像はペーストでも追加できます)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onPaste={handlePaste}
                className="min-h-[300px] rounded-t-none font-mono"
                error={state?.errors?.content?.[0]}
              />
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-b-lg bg-white/80">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    画像をアップロード中...
                  </div>
                </div>
              )}
            </div>
            <CharacterCounter text={content} className="mt-2" />
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
