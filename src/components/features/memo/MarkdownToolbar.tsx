'use client';

import { useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  Link as LinkIcon,
  Quote,
  Minus,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { IconButton } from '@/components/ui';

interface MarkdownToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onContentChange: (content: string) => void;
}

type FormatType =
  | 'bold'
  | 'italic'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'ul'
  | 'ol'
  | 'code'
  | 'link'
  | 'quote'
  | 'hr';

export function MarkdownToolbar({
  textareaRef,
  onContentChange,
}: MarkdownToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルのみアップロードできます');
      return;
    }

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

  const insertImageMarkdown = (url: string, alt: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const text = textarea.value;
    const imageMarkdown = `![${alt}](${url})`;
    const newText =
      text.substring(0, start) + imageMarkdown + text.substring(start);

    onContentChange(newText);

    setTimeout(() => {
      textarea.focus();
      const newPosition = start + imageMarkdown.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
    e.target.value = '';
  };

  const insertFormat = (type: FormatType) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    let newText = '';
    let cursorOffset = 0;

    switch (type) {
      case 'bold':
        newText =
          text.substring(0, start) +
          `**${selectedText || 'テキスト'}**` +
          text.substring(end);
        cursorOffset = selectedText ? end + 4 : start + 2;
        break;

      case 'italic':
        newText =
          text.substring(0, start) +
          `*${selectedText || 'テキスト'}*` +
          text.substring(end);
        cursorOffset = selectedText ? end + 2 : start + 1;
        break;

      case 'h1':
        newText = insertAtLineStart(text, start, end, '# ');
        cursorOffset = start + 2;
        break;

      case 'h2':
        newText = insertAtLineStart(text, start, end, '## ');
        cursorOffset = start + 3;
        break;

      case 'h3':
        newText = insertAtLineStart(text, start, end, '### ');
        cursorOffset = start + 4;
        break;

      case 'ul':
        newText = insertAtLineStart(text, start, end, '- ');
        cursorOffset = start + 2;
        break;

      case 'ol':
        newText = insertAtLineStart(text, start, end, '1. ');
        cursorOffset = start + 3;
        break;

      case 'code':
        if (selectedText.includes('\n')) {
          newText =
            text.substring(0, start) +
            `\`\`\`\n${selectedText}\n\`\`\`` +
            text.substring(end);
          cursorOffset = end + 8;
        } else {
          newText =
            text.substring(0, start) +
            `\`${selectedText || 'コード'}\`` +
            text.substring(end);
          cursorOffset = selectedText ? end + 2 : start + 1;
        }
        break;

      case 'link':
        newText =
          text.substring(0, start) +
          `[${selectedText || 'リンクテキスト'}](url)` +
          text.substring(end);
        cursorOffset = selectedText ? end + 7 : start + 1;
        break;

      case 'quote':
        newText = insertAtLineStart(text, start, end, '> ');
        cursorOffset = start + 2;
        break;

      case 'hr':
        const lineStart = text.lastIndexOf('\n', start - 1) + 1;
        const needsNewlineBefore = lineStart !== start;
        const insertText = needsNewlineBefore ? '\n\n---\n\n' : '---\n\n';
        newText =
          text.substring(0, start) + insertText + text.substring(end);
        cursorOffset = start + insertText.length;
        break;
    }

    onContentChange(newText);

    // カーソル位置を設定
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorOffset, cursorOffset);
    }, 0);
  };

  // 行頭に文字列を挿入するヘルパー
  const insertAtLineStart = (
    text: string,
    start: number,
    end: number,
    prefix: string
  ) => {
    const lineStart = text.lastIndexOf('\n', start - 1) + 1;
    return text.substring(0, lineStart) + prefix + text.substring(lineStart);
  };

  const tools: { type: FormatType; icon: React.ReactNode; label: string }[] = [
    { type: 'bold', icon: <Bold className="h-4 w-4" />, label: '太字' },
    { type: 'italic', icon: <Italic className="h-4 w-4" />, label: '斜体' },
    { type: 'h1', icon: <Heading1 className="h-4 w-4" />, label: '見出し1' },
    { type: 'h2', icon: <Heading2 className="h-4 w-4" />, label: '見出し2' },
    { type: 'h3', icon: <Heading3 className="h-4 w-4" />, label: '見出し3' },
    { type: 'ul', icon: <List className="h-4 w-4" />, label: '箇条書き' },
    { type: 'ol', icon: <ListOrdered className="h-4 w-4" />, label: '番号リスト' },
    { type: 'code', icon: <Code className="h-4 w-4" />, label: 'コード' },
    { type: 'link', icon: <LinkIcon className="h-4 w-4" />, label: 'リンク' },
    { type: 'quote', icon: <Quote className="h-4 w-4" />, label: '引用' },
    { type: 'hr', icon: <Minus className="h-4 w-4" />, label: '水平線' },
  ];

  return (
    <div className="flex flex-wrap gap-1 rounded-t-lg border border-b-0 border-gray-300 bg-gray-50 p-1">
      {tools.map((tool) => (
        <IconButton
          key={tool.type}
          variant="ghost"
          size="sm"
          label={tool.label}
          onClick={() => insertFormat(tool.type)}
          className="text-gray-600 hover:bg-gray-200 hover:text-gray-900"
        >
          {tool.icon}
        </IconButton>
      ))}

      {/* Image Upload Button */}
      <IconButton
        variant="ghost"
        size="sm"
        label="画像"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="text-gray-600 hover:bg-gray-200 hover:text-gray-900"
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ImageIcon className="h-4 w-4" />
        )}
      </IconButton>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
