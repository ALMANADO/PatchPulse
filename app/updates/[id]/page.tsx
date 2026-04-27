import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import Link from 'next/link';
import { Update } from '@/types';
import Logo from '@/app/components/Logo';
import AISummary from '@/app/components/AISummary';

const moduleBadge: Record<string, string> = {
  'Financials': 'bg-emerald-900/40 text-emerald-400 border-emerald-800/50',
  'HCM': 'bg-blue-900/40 text-blue-400 border-blue-800/50',
  'Supply Chain': 'bg-orange-900/40 text-orange-400 border-orange-800/50',
  'Customer Experience': 'bg-pink-900/40 text-pink-400 border-pink-800/50',
  'Common Technologies': 'bg-violet-900/40 text-violet-400 border-violet-800/50',
};

export default async function UpdateDetail({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const result = await db`SELECT * FROM updates WHERE id = ${params.id}`;
  const update = result[0] as Update;

  if (!update) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">
        Update not found.{' '}
        <Link href="/dashboard" className="text-violet-400 underline ml-1">Back to dashboard</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.08) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Logo size={28} />
            <span className="font-semibold tracking-tight text-sm">PatchPulse</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-xs text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-6">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
              update.product === 'OIC'
                ? 'bg-blue-900/40 text-blue-400 border-blue-800/50'
                : 'bg-violet-900/40 text-violet-400 border-violet-800/50'
            }`}>
              {update.product}
            </span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-lg border capitalize ${
              update.module ? (moduleBadge[update.module] ?? 'bg-zinc-800/40 text-zinc-400 border-zinc-700/50') : 'bg-blue-900/40 text-blue-400 border-blue-800/50'
            }`}>
              {update.module || 'Cloud'}
            </span>
            <span className="text-xs font-mono text-zinc-600 ml-1">{update.patch_version}</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-semibold text-white leading-snug mb-2">{update.title}</h1>
          <p className="text-zinc-500 text-sm mb-8">
            {new Date(update.release_date).toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>

          <div className="border-t border-zinc-800 pt-7 mb-8">
            <p className="text-zinc-300 leading-relaxed text-sm">{update.full_synopsis}</p>
          </div>

          <AISummary
            title={update.title}
            synopsis={update.full_synopsis ?? update.description ?? ''}
            url={update.official_news_url}
          />

          {/* Action buttons — all clearly visible */}
          <div className="flex flex-wrap gap-3">
            <a
              href={update.official_news_url}
              target="_blank"
              rel="noreferrer"
              className="flex-1 min-w-[140px] text-center bg-violet-600 hover:bg-violet-500 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
            >
              Official Release Notes ↗
            </a>
            <a
              href={update.docs_url}
              target="_blank"
              rel="noreferrer"
              className="flex-1 min-w-[140px] text-center bg-zinc-700 hover:bg-zinc-600 border border-zinc-600 text-zinc-100 hover:text-white py-3 rounded-xl font-medium text-sm transition-colors"
            >
              Documentation ↗
            </a>
            <Link
              href="/dashboard"
              className="flex-1 min-w-[140px] text-center bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-zinc-300 hover:text-white py-3 rounded-xl font-medium text-sm transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
