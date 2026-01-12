'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, FileText, Tag } from 'lucide-react';
import { IconButton, Badge } from '@/components/ui';
import type { TagWithCount } from '@/types';

interface MobileSidebarProps {
  tags: TagWithCount[];
  activeTagId?: string;
}

export function MobileSidebar({ tags, activeTagId }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle Button */}
      <div className="fixed bottom-4 left-4 z-50 lg:hidden">
        <IconButton
          label={isOpen ? 'メニューを閉じる' : 'メニューを開く'}
          onClick={() => setIsOpen(!isOpen)}
          className="h-12 w-12 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:text-white"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </IconButton>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-xl transition-transform duration-300 lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 text-lg font-bold text-gray-900"
          >
            <FileText className="h-5 w-5 text-blue-600" />
            Memo App
          </Link>
          <IconButton
            label="閉じる"
            onClick={() => setIsOpen(false)}
            variant="ghost"
          >
            <X className="h-5 w-5" />
          </IconButton>
        </div>

        <nav className="flex flex-col p-4">
          {/* All Memos */}
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className={`mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              !activeTagId
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FileText className="h-4 w-4" />
            すべてのメモ
          </Link>

          {/* Divider */}
          <div className="my-4 border-t border-gray-200" />

          {/* Tags Section */}
          <div className="mb-2 flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <Tag className="h-3 w-3" />
            タグ
          </div>

          {/* Tag List */}
          {tags.length === 0 ? (
            <p className="px-3 py-2 text-sm text-gray-500">タグがありません</p>
          ) : (
            <ul className="space-y-1">
              {tags.map((tag) => (
                <li key={tag.id}>
                  <Link
                    href={`/?tag=${tag.id}`}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                      activeTagId === tag.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: tag.color || '#6B7280' }}
                      />
                      {tag.name}
                    </span>
                    {tag._count && (
                      <Badge size="sm" variant="default">
                        {tag._count.memos}
                      </Badge>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </nav>
      </aside>
    </>
  );
}
