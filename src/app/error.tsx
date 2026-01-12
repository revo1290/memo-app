'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button, EmptyState } from '@/components/ui';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <EmptyState
        icon={<AlertCircle className="h-12 w-12 text-red-500" />}
        title="エラーが発生しました"
        description={error.message || '予期しないエラーが発生しました。'}
        action={
          <Button onClick={reset} variant="primary">
            再試行
          </Button>
        }
      />
    </div>
  );
}
