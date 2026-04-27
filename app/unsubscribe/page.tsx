'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Logo from '@/app/components/Logo';
import Link from 'next/link';

function UnsubscribeForm() {
  const params = useSearchParams();
  const email = params.get('email') || '';

  const [subscribed, setSubscribed] = useState(true);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Pull current subscription status from DB on mount
  useEffect(() => {
    if (!email) { setLoading(false); return; }
    fetch(`/api/unsubscribe/preferences?email=${encodeURIComponent(email)}`)
      .then(r => r.json())
      .then(data => {
        setSubscribed(data.subscribed ?? true);
      })
      .catch(() => {
        setSubscribed(true);
      })
      .finally(() => setLoading(false));
  }, [email]);

  async function submit(newStatus: boolean) {
    setStatus('saving');
    try {
      const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, subscribed: newStatus }),
      });
      if (res.ok) {
        setSubscribed(newStatus);
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  if (!email) return (
    <div className="text-center text-zinc-400 mt-20">
      Invalid unsubscribe link.{' '}
      <Link href="/" className="text-violet-400 underline">Go home</Link>
    </div>
  );

  if (status === 'success') return (
    <div className="text-center mt-20 px-4">
      <div className="text-5xl mb-4">✅</div>
      <h2 className="text-2xl font-semibold text-white mb-2">Preferences saved</h2>
      <p className="text-zinc-400 text-sm mb-6">
        Email notifications {subscribed ? 'enabled' : 'disabled'} for <span className="text-violet-400">{email}</span>.
      </p>
      <Link href="/login" className="text-violet-400 hover:text-violet-300 text-sm underline">
        Sign in to manage detailed preferences
      </Link>
    </div>
  );

  return (
    <div className="max-w-md mx-auto mt-16 px-4 pb-16">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
        <h2 className="text-xl font-semibold text-white mb-1">Notification Settings</h2>
        <p className="text-zinc-400 text-sm mb-8">
          Managing alerts for <span className="text-violet-400 font-mono">{email}</span>
        </p>

        {loading ? (
          <div className="text-zinc-500 text-sm text-center py-8">Loading preferences…</div>
        ) : (
          <>
            <div className="mb-8 space-y-3">
              <button
                onClick={() => submit(true)}
                disabled={status === 'saving'}
                className={`w-full py-3 px-4 rounded-xl border font-medium text-sm transition-all ${
                  subscribed
                    ? 'bg-green-600 border-green-500 text-white'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                }`}
              >
                {status === 'saving' ? 'Saving…' : '✓ Subscribe to alerts'}
              </button>
              <button
                onClick={() => submit(false)}
                disabled={status === 'saving'}
                className={`w-full py-3 px-4 rounded-xl border font-medium text-sm transition-all ${
                  !subscribed
                    ? 'bg-red-600 border-red-500 text-white'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                }`}
              >
                {status === 'saving' ? 'Saving…' : '✕ Unsubscribe from all'}
              </button>
            </div>

            <p className="text-xs text-zinc-600 border-t border-zinc-800 pt-4">
              To manage detailed product and module preferences, sign in to your account.
            </p>

            {status === 'error' && (
              <p className="text-xs text-red-400 mt-4 text-center">Failed to save. Please try again.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function Unsubscribe() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <div
        className="fixed inset-0 pointer-events-none opacity-40 z-0"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.08) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />

      <header className="relative z-10 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={28} />
            <span className="font-semibold tracking-tight text-sm">PatchPulse</span>
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1">
        <Suspense fallback={<div className="text-center text-zinc-400 mt-20">Loading…</div>}>
          <UnsubscribeForm />
        </Suspense>
      </main>
    </div>
  );
}
