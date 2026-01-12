'use client';

import { useState, useCallback, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

export interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  debounceMs?: number;
}

export function SearchBar({
  placeholder = 'メモを検索...',
  className,
  onSearch,
  debounceMs = 300,
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('search') || '');

  const debouncedQuery = useDebounce(query, debounceMs);

  // URL更新
  const updateSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set('search', value);
      } else {
        params.delete('search');
      }
      router.push(`?${params.toString()}`);
      onSearch?.(value);
    },
    [router, searchParams, onSearch]
  );

  // デバウンス後に検索実行
  useState(() => {
    if (debouncedQuery !== searchParams.get('search')) {
      updateSearch(debouncedQuery);
    }
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    updateSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-10 text-sm',
          'placeholder:text-gray-400',
          'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0'
        )}
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label="検索をクリア"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}
