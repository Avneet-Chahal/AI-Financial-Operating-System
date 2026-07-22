import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AppShell from '@/components/layout/AppShell';

/**
 * Authenticated area layout. Every route under (app) requires a session;
 * unauthenticated visitors are redirected to /login. This server-side guard
 * is the primary access control (Prisma runs in the Node runtime, not Edge).
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  return <AppShell>{children}</AppShell>;
}
