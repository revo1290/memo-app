'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface CharacterCounterProps {
  text: string;
  className?: string;
}

export function CharacterCounter({ text, className }: CharacterCounterProps) {
  const stats = useMemo(() => {
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text ? text.split('\n').length : 0;

    return { chars, charsNoSpaces, words, lines };
  }, [text]);

  return (
    <div className={cn('flex flex-wrap gap-4 text-xs text-gray-500', className)}>
      <span>
        <span className="font-medium text-gray-700">{stats.chars.toLocaleString()}</span> 文字
      </span>
      <span>
        <span className="font-medium text-gray-700">{stats.charsNoSpaces.toLocaleString()}</span> 文字（空白除く）
      </span>
      <span>
        <span className="font-medium text-gray-700">{stats.words.toLocaleString()}</span> 単語
      </span>
      <span>
        <span className="font-medium text-gray-700">{stats.lines.toLocaleString()}</span> 行
      </span>
    </div>
  );
}
