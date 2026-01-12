import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import { Button, EmptyState } from '@/components/ui';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <EmptyState
        icon={<FileQuestion className="h-12 w-12" />}
        title="ページが見つかりません"
        description="お探しのページは存在しないか、移動した可能性があります。"
        action={
          <Link href="/">
            <Button>ホームに戻る</Button>
          </Link>
        }
      />
    </div>
  );
}
