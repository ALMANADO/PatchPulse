'use client';

import { useEffect, useState } from 'react';

interface Props {
  title: string;
  synopsis: string;
  url: string;
}

export default function AISummary({ title, synopsis, url }: Props) {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, synopsis, url }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError('Could not load summary.');
        else setSummary(data.summary);
      })
      .catch(() => setError('Could not load summary.'))
      .finally(() => setLoading(false));
  }, [title, synopsis, url]);

  return (
    <div className="border border-zinc-700 rounded-xl p-5 mb-8 bg-zinc-800/40">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">
          ✦ AI Summary
        </span>
        <span className="text-xs text-zinc-600">powered by Groq</span>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-zinc-500 text-sm">
          <span className="animate-spin inline-block w-3 h-3 border border-zinc-500 border-t-violet-400 rounded-full" />
          Generating summary…
        </div>
      )}

      {error && <p className="text-zinc-500 text-sm">{error}</p>}

      {!loading && !error && summary && (
        <ul className="space-y-2">
          {summary
            .split('\n')
            .map((line) => line.replace(/^[-•*]\s*/, '').trim())
            .filter(Boolean)
            .map((line, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />
                {line}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
