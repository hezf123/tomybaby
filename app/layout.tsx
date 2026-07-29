import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/AuthContext';

export const metadata: Metadata = {
  title: 'To You - 专属你的浪漫空间',
  description: '一个为你量身定制的浪漫互动平台',
  keywords: ['情侣', '浪漫', '表白', '生日祝福'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
