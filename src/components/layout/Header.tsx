import Link from 'next/link';
import { Suspense } from 'react';
import { PenSquare, FileText } from 'lucide-react';
import { Button } from '@/components/ui';
import { SearchBar } from '@/components/ui/SearchBar';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-gray-900"
        >
          <FileText className="h-6 w-6 text-blue-600" />
          <span className="hidden sm:inline">Memo App</span>
        </Link>

        {/* Search Bar */}
        <div className="mx-4 hidden max-w-md flex-1 sm:block">
          <Suspense fallback={<div className="h-10 animate-pulse rounded-lg bg-gray-100" />}>
            <SearchBar />
          </Suspense>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button size="sm" asChild>
            <Link href="/memo/new">
              <PenSquare className="h-4 w-4" />
              <span className="hidden sm:inline">新規作成</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="border-t border-gray-100 px-4 py-2 sm:hidden">
        <Suspense fallback={<div className="h-10 animate-pulse rounded-lg bg-gray-100" />}>
          <SearchBar />
        </Suspense>
      </div>
    </header>
  );
}
