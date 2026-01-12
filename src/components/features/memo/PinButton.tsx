'use client';

import { useTransition } from 'react';
import { Star } from 'lucide-react';
import { IconButton } from '@/components/ui';
import { togglePin } from '@/server/actions/memo';

interface PinButtonProps {
  memoId: string;
  isPinned: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PinButton({ memoId, isPinned, size = 'sm' }: PinButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      await togglePin(memoId);
    });
  };

  return (
    <IconButton
      label={isPinned ? 'ピン留めを解除' : 'ピン留め'}
      onClick={handleClick}
      disabled={isPending}
      size={size}
      variant={isPinned ? 'primary' : 'default'}
      className={isPinned ? 'text-yellow-500 hover:text-yellow-600' : ''}
    >
      <Star
        className={`h-4 w-4 ${isPinned ? 'fill-current' : ''} ${
          isPending ? 'animate-pulse' : ''
        }`}
      />
    </IconButton>
  );
}
