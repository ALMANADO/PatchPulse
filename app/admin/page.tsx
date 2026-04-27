import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import Link from 'next/link';
import AdminActions from './AdminActions';

export default async function Admin() {
  const session = await getServerSession(authOptions);
  
  // ✅ FIX: Verify session exists and email matches ADMIN_EMAIL env var
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    console.warn('⚠️ Unauthorized admin access attempt:', session?.user?.email);
    redirect('/login');
  }
  
  // ✅ FIX: Double-verify user exists in database (safe after null check above)
  try {
    const adminUser = await db`SELECT email FROM users WHERE email = ${session.user.email}`;
    if (!adminUser.length) {
      console.error('❌ Admin user not found in database:', session.user.email);
      redirect('/login');
    }
  } catch (err) {
    console.error('❌ Admin database verification failed:', err);
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.08) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <header className="relative z-10 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
              P
            </div>
            <span className="font-semibold tracking-tight text-sm">PatchPulse</span>
            <span className="px-2 py-0.5 text-xs bg-amber-900/40 text-amber-400 border border-amber-800/50 rounded-lg font-medium">Admin</span>
          </div>
          <Link href="/dashboard" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold mb-1">Admin Panel</h1>
        <p className="text-zinc-500 text-sm mb-8">Manage scraping and system operations.</p>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-lg">
          <h2 className="font-medium text-white mb-1">Manual Scrape</h2>
          <p className="text-zinc-500 text-sm mb-5">
            Triggers an immediate scrape of Oracle docs. The cron job runs automatically every 6 hours.
          </p>
          <AdminActions />
        </div>
      </main>
    </div>
  );
}