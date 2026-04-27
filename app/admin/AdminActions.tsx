'use client';

import { useState } from 'react';

export default function AdminActions() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState('');

  const triggerScrape = async () => {
    setStatus('loading');
    setResult('');
    try {
      const res = await fetch('/api/admin/trigger-scrape', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setResult(`Done — ${data.newUpdates ?? 0} new update${data.newUpdates === 1 ? '' : 's'} inserted.`);
      } else {
        setStatus('error');
        setResult(data.error || 'Scrape failed');
      }
    } catch {
      setStatus('error');
      setResult('Network error. Please try again.');
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={triggerScrape}
        disabled={status === 'loading'}
        className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
      >
        {status === 'loading' ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Scraping…
          </>
        ) : '🚀 Trigger Scrape Now'}
      </button>
      {status === 'success' && <p className="text-green-400 text-xs font-medium">✓ {result}</p>}
      {status === 'error'   && <p className="text-red-400 text-xs">{result}</p>}
    </div>
  );
}
