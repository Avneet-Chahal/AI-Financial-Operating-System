import { Inter } from 'next/font/google';
import './globals.css';
import AuthSessionProvider from '@/components/providers/SessionProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'AI Financial Operating System (AI-FOS)',
  description: 'AI-powered personal finance platform with multi-agent intelligence',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased overflow-hidden">
        {/* AppShell now lives in the (app) route group so auth pages render without it. */}
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
