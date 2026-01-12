'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';

interface MemoPreviewProps {
  content: string;
  className?: string;
}

export function MemoPreview({ content, className }: MemoPreviewProps) {
  if (!content) {
    return (
      <p className={cn('text-sm text-gray-400 italic', className)}>
        プレビューする内容がありません
      </p>
    );
  }

  return (
    <div
      className={cn(
        'prose prose-sm max-w-none',
        'prose-headings:font-semibold prose-headings:text-gray-900',
        'prose-p:text-gray-600',
        'prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline',
        'prose-code:rounded prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5',
        'prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200',
        'prose-ul:text-gray-600 prose-ol:text-gray-600',
        'prose-blockquote:border-l-blue-500 prose-blockquote:text-gray-600',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;

            if (isInline) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }

            return (
              <SyntaxHighlighter
                style={oneLight}
                language={match[1]}
                PreTag="div"
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
