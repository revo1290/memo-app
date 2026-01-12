import { cn } from '@/lib/utils';

export interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200',
        className
      )}
    />
  );
}

// メモカード用スケルトン
export function MemoCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-5 w-5" />
      </div>
      <div className="mt-3 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
      <div className="mt-3">
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

// メモリスト用スケルトン
export function MemoListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <MemoCardSkeleton key={i} />
      ))}
    </div>
  );
}

// サイドバー用スケルトン
export function SidebarSkeleton() {
  return (
    <div className="space-y-2 p-4">
      <Skeleton className="mb-4 h-6 w-24" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-full" />
      ))}
    </div>
  );
}
