import './globals.css';
import AppShell from '@/components/layout/AppShell';

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
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
