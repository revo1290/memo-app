import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Memo App',
    template: '%s | Memo App',
  },
  description: 'シンプルで使いやすいメモ帳アプリケーション',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${inter.className} bg-gray-50 antialiased`}>
        {children}
      </body>
    </html>
  );
}
