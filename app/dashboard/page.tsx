import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import Link from 'next/link';
import { Update } from '@/types';
import DashboardActions from './DashboardActions';
import Logo from '@/app/components/Logo';
import DashboardSearch from './DashboardSearch';

const HISTORY_START = '2026-01-01';

async function getUpdatesForUser(email: string): Promise<{ updates: Update[]; isFiltered: boolean }> {
  const userResult = await db`SELECT preferences FROM users WHERE email = ${email}`;
  const prefs = userResult[0]?.preferences as { products?: string[]; fusionModules?: string[] } | null;

  const hasProducts = prefs?.products && prefs.products.length > 0;
  const hasFusionModules = prefs?.fusionModules && prefs.fusionModules.length > 0;

  // If user selected FUSION and specific modules, filter by both
  if (prefs?.products?.includes('FUSION') && hasFusionModules) {
    // 🔧 FIX: Get non-Fusion products to avoid impossible SQL condition
    const nonFusionProducts = prefs.products!.filter(p => p !== 'FUSION');
    
    const result = await db`
      SELECT * FROM updates
      WHERE product = 'FUSION'
        AND module = ANY(${prefs.fusionModules!}::text[])
        AND release_date >= ${HISTORY_START}
      UNION ALL
      SELECT * FROM updates
      WHERE product = ANY(${nonFusionProducts}::text[])
        AND release_date >= ${HISTORY_START}
      ORDER BY release_date DESC
    `;
    return { updates: result as Update[], isFiltered: true };
  }

  // User selected FUSION but no specific modules — show all Fusion modules
  if (prefs?.products?.includes('FUSION')) {
    const result = await db`
      SELECT * FROM updates
      WHERE product = ANY(${prefs.products!}::text[])
        AND release_date >= ${HISTORY_START}
      ORDER BY release_date DESC
    `;
    return { updates: result as Update[], isFiltered: true };
  }

  // No products selected — show all from Jan 2026
  if (!hasProducts) {
    const result = await db`
      SELECT * FROM updates
      WHERE release_date >= ${HISTORY_START}
      ORDER BY release_date DESC
    `;
    return { updates: result as Update[], isFiltered: false };
  }

  // User selected other products (OIC, etc.)
  const result = await db`
    SELECT * FROM updates
    WHERE product = ANY(${prefs!.products!}::text[])
      AND release_date >= ${HISTORY_START}
    ORDER BY release_date DESC
  `;
  return { updates: result as Update[], isFiltered: true };
}

const moduleBadge: Record<string, string> = {
  'Financials': 'bg-emerald-900/40 text-emerald-400 border-emerald-800/50',
  'HCM': 'bg-blue-900/40 text-blue-400 border-blue-800/50',
  'Supply Chain': 'bg-orange-900/40 text-orange-400 border-orange-800/50',
  'Customer Experience': 'bg-pink-900/40 text-pink-400 border-pink-800/50',
  'Common Technologies': 'bg-violet-900/40 text-violet-400 border-violet-800/50',
};

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect('/login');

  const { updates, isFiltered } = await getUpdatesForUser(session.user.email);
  const userResult = await db`SELECT preferences, subscribed FROM users WHERE email = ${session.user.email}`;
  const user = userResult[0];
  
  // ✅ FIX: Strengthen admin check - verify both email AND session admin flag
  const isAdmin = 
    session.user.email === process.env.ADMIN_EMAIL && 
    (session.user as any).adminVerified === true;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="fixed inset-0 pointer-events-none opacity-40 z-0"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.08) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />

      <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Logo size={28} />
            <span className="font-semibold tracking-tight text-sm text-white">PatchPulse</span>
          </Link>
          <div className="flex items-center gap-5">
            <span className="text-xs text-zinc-600 hidden sm:block">{session.user.email}</span>
            {isAdmin && (
              <Link href="/admin" className="text-xs font-medium text-amber-500 hover:text-amber-400 transition-colors">
                Admin ⚙
              </Link>
            )}
            <DashboardActions />
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Updates Library</h1>
            <p className="text-zinc-500 text-sm mt-1">
              {updates.length > 0
                ? `${updates.length} patch${updates.length === 1 ? '' : 'es'} found · Jan 2026 onwards`
                : 'No updates yet — trigger a scrape from the Admin panel or wait for the scheduled run'}
              {isFiltered && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs text-violet-400 bg-violet-900/30 border border-violet-800/40 px-2 py-0.5 rounded-full">
                  ✦ Filtered by your preferences
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Live monitoring
            </div>
          </div>
        </div>

        <DashboardSearch updates={updates} moduleBadge={moduleBadge} />

        <div className="mt-10 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm">
          <h3 className="text-sm font-semibold text-white mb-4">Your alert preferences</h3>
          {user?.preferences ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-600 mb-1.5">Products</p>
                <div className="flex gap-1.5 flex-wrap">
                  {user.preferences.products?.map((p: string) => (
                    <span key={p} className="px-2.5 py-1 bg-zinc-800 text-zinc-300 rounded-lg text-xs font-medium">{p}</span>
                  ))}
                </div>
              </div>
              {user.preferences.products?.includes('FUSION') && user.preferences.fusionModules && user.preferences.fusionModules.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-600 mb-1.5">Fusion Modules</p>
                  <div className="flex flex-wrap gap-1.5">
                    {user.preferences.fusionModules?.map((m: string) => (
                      <span key={m} className="px-2.5 py-1 bg-zinc-800 text-zinc-300 rounded-lg text-xs">{m}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${user.subscribed ? 'bg-green-500' : 'bg-zinc-600'}`} />
                <span className="text-xs text-zinc-500">
                  {user.subscribed ? 'Subscribed to alerts' : 'Alerts paused'}
                </span>
              </div>
              <p className="text-xs text-zinc-600 border-t border-zinc-800 pt-3">
                Library shows all updates for your chosen products/modules from Jan 2026. New updates are added every 6 hours.
              </p>
            </div>
          ) : (
            <p className="text-zinc-600 text-sm">No preferences found.</p>
          )}
        </div>
      </main>
    </div>
  );
}