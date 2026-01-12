'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export interface SortOption {
  value: string;
  label: string;
}

export interface SortSelectProps {
  options?: SortOption[];
  className?: string;
}

const defaultOptions: SortOption[] = [
  { value: 'updatedAt-desc', label: '更新日（新しい順）' },
  { value: 'updatedAt-asc', label: '更新日（古い順）' },
  { value: 'createdAt-desc', label: '作成日（新しい順）' },
  { value: 'createdAt-asc', label: '作成日（古い順）' },
  { value: 'title-asc', label: 'タイトル（A-Z）' },
  { value: 'title-desc', label: 'タイトル（Z-A）' },
];

export function SortSelect({
  options = defaultOptions,
  className,
}: SortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get('sort') || 'updatedAt';
  const currentOrder = searchParams.get('order') || 'desc';
  const currentValue = `${currentSort}-${currentOrder}`;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sort, order] = e.target.value.split('-');
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', sort);
    params.set('order', order);
    router.push(`?${params.toString()}`);
  };

  return (
    <select
      value={currentValue}
      onChange={handleChange}
      className={cn(
        'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm',
        'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500',
        className
      )}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
