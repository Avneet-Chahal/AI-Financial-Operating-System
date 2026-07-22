import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

/**
 * Auth pages layout (login / signup). Centered card on the dark gradient
 * backdrop, no AppShell. Already-authenticated users are bounced to the dashboard.
 */
export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow accents */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}
