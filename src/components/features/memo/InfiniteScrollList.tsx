'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MemoCard } from './MemoCard';
import { Spinner } from '@/components/ui';
import { fetchMoreMemos } from '@/server/actions/memo';
import type { MemoWithTags, MemoSearchParams, PaginationInfo } from '@/types';

interface InfiniteScrollListProps {
  initialMemos: MemoWithTags[];
  initialPagination: PaginationInfo;
  searchParams: MemoSearchParams;
}

export function InfiniteScrollList({
  initialMemos,
  initialPagination,
  searchParams,
}: InfiniteScrollListProps) {
  const [memos, setMemos] = useState<MemoWithTags[]>(initialMemos);
  const [pagination, setPagination] = useState<PaginationInfo>(initialPagination);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  // Reset when search params change
  useEffect(() => {
    setMemos(initialMemos);
    setPagination(initialPagination);
  }, [initialMemos, initialPagination]);

  const loadMore = useCallback(async () => {
    if (isLoading || !pagination.hasMore) return;

    setIsLoading(true);
    try {
      const result = await fetchMoreMemos({
        ...searchParams,
        page: pagination.page + 1,
      });

      if (result.success && result.data) {
        setMemos((prev) => [...prev, ...result.data!.memos]);
        setPagination(result.data.pagination);
      }
    } catch (error) {
      console.error('Failed to load more memos:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, pagination.hasMore, pagination.page, searchParams]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && pagination.hasMore && !isLoading) {
          loadMore();
        }
      },
      { rootMargin: '100px' }
    );

    const currentRef = observerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [loadMore, pagination.hasMore, isLoading]);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {memos.map((memo) => (
          <MemoCard key={memo.id} memo={memo} />
        ))}
      </div>

      {/* Loading indicator / Observer target */}
      <div ref={observerRef} className="mt-8 flex justify-center">
        {isLoading && <Spinner size="md" />}
        {!pagination.hasMore && memos.length > 0 && (
          <p className="text-sm text-gray-500">すべてのメモを表示しました</p>
        )}
      </div>
    </>
  );
}
