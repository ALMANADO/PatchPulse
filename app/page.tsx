import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/app/components/Logo';

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:60px_60px] opacity-30" />

      <div className="relative max-w-screen-xl mx-auto px-6">
        {/* header */}
        <header className="flex items-center justify-between py-8">
          <div className="flex items-center gap-3">
            <Logo size={36} />
            <span className="text-2xl font-semibold tracking-tight">PatchPulse</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium px-6 py-2.5 rounded-3xl hover:bg-white/10 transition-colors">
              Sign in
            </Link>
            <Link href="/register" className="bg-white text-zinc-900 hover:bg-white/90 px-7 py-2.5 rounded-3xl font-semibold transition-colors">
              Get started
            </Link>
          </div>
        </header>

        {/* hero */}
        <div className="pt-16 pb-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-medium px-6 py-2 rounded-3xl mb-6">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
            </span>
            Monitoring OIC Gen 3 • Fusion Cloud • every 6 hours
          </div>

          <h1 className="text-7xl font-semibold tracking-tighter leading-none max-w-3xl mx-auto">
            Never miss an{' '}
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Oracle patch
            </span>{' '}
            again.
          </h1>

          <p className="mt-6 text-xl text-zinc-400 max-w-xl mx-auto">
            PatchPulse scrapes Oracle&apos;s release feeds and fires instant email alerts the moment a new{' '}
            <span className="text-violet-300">OIC</span> or{' '}
            <span className="text-purple-300">Fusion Cloud</span> update drops.
          </p>

          <div className="flex items-center justify-center gap-4 mt-10">
            <Link
              href="/register"
              className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white px-9 py-4 rounded-3xl font-semibold text-lg flex items-center gap-3 transition-all active:scale-95"
            >
              Get Started Free →
            </Link>
          </div>

          <div className="flex justify-center gap-3 mt-16 flex-wrap">
            {['⚡ Instant email alerts', '🤖 Automated scraping', '📊 Release dashboard', '🔓 Free to use'].map((badge) => (
              <div key={badge} className="bg-white/5 text-white/80 text-sm font-medium px-5 py-2 rounded-3xl border border-white/10">
                {badge}
              </div>
            ))}
          </div>
        </div>

        {/* email preview */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-zinc-950 h-11 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div className="ml-4 text-xs text-zinc-400 font-medium">Inbox — PatchPulse Alert</div>
            </div>
            <div className="p-8 bg-zinc-900">
              <div className="flex items-center gap-3">
                <Logo size={36} />
                <div>
                  <div className="font-semibold">PatchPulse</div>
                  <div className="text-xs text-zinc-400">noreply@patchpulse.app</div>
                </div>
              </div>
              <div className="mt-6 text-emerald-400 text-sm font-medium flex items-center gap-1">
                <span>🔔</span> NEW RELEASE ALERT
              </div>
              <h3 className="text-2xl font-semibold mt-2">Fusion Common Technologies: 26B</h3>
              <p className="text-zinc-400 mt-3">New Fusion Cloud 26B update now available with performance improvements and security patches.</p>
              <div className="flex gap-3 mt-8">
                <button className="flex-1 bg-white text-zinc-900 py-4 rounded-3xl font-semibold flex items-center justify-center gap-2 hover:bg-white/90">
                  📄 Summary
                </button>
                <button className="flex-1 bg-zinc-800 py-4 rounded-3xl font-semibold flex items-center justify-center gap-2 hover:bg-zinc-700">
                  📢 Release News
                </button>
                <button className="flex-1 bg-zinc-800 py-4 rounded-3xl font-semibold flex items-center justify-center gap-2 hover:bg-zinc-700">
                  📚 Docs
                </button>
              </div>
              <p className="text-center text-xs text-zinc-500 mt-8">This is what you will receive. Instantly.</p>
            </div>
          </div>
        </div>
        <p className="text-center text-zinc-500 text-sm mt-12">Built for OIC Gen 3 developers and Fusion consultants</p>
      </div>
    </div>
  );
}
