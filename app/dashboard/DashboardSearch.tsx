'use client';

import { useState, useMemo } from 'react';
import { Update } from '@/types';
import Link from 'next/link';

interface Props {
  updates: Update[];
  moduleBadge: Record<string, string>;
}

export default function DashboardSearch({ updates, moduleBadge }: Props) {
  const [query, setQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const filtered = useMemo(() => {
    return updates.filter(u => {
      const matchesName = u.title.toLowerCase().includes(query.toLowerCase());
      const matchesDate = dateFilter === '' || u.release_date.startsWith(dateFilter);
      return matchesName && matchesDate;
    });
  }, [updates, query, dateFilter]);

  return (
    <>
      {/* Search bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search by update name..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-700 transition-colors"
          />
        </div>
        <input
          type="date"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-violet-700 transition-colors"
        />
      </div>

      {/* Results grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔎</div>
          <p className="text-zinc-400">No results found</p>
          <p className="text-zinc-600 text-sm">Try a different name or date.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(update => {
            // Format release_date as YYYY-MM-DD to human-readable
            const releaseDate = new Date(update.release_date);
            const formattedDate = releaseDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div key={update.hash} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                    update.product === 'OIC'
                      ? 'bg-blue-900/40 text-blue-400 border-blue-800/50'
                      : 'bg-violet-900/40 text-violet-400 border-violet-800/50'
                  }`}>
                    {update.product}
                  </span>
                  {update.module && (
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-lg border capitalize ${
                      moduleBadge[update.module] ?? 'bg-zinc-800/40 text-zinc-400 border-zinc-700/50'
                    }`}>
                      {update.module}
                    </span>
                  )}
                </div>

                <h3 className="font-medium text-white leading-snug mb-1 text-sm">{update.title}</h3>
                <p className="text-xs text-zinc-600 mb-3 font-mono">
                  {update.patch_version} · {formattedDate}
                </p>
                <p className="text-sm text-zinc-400 line-clamp-2 mb-5 flex-1 leading-relaxed">
                  {update.description}
                </p>
                <Link
                  href={`/updates/${update.id}`}
                  className="block text-center py-2 text-xs font-semibold text-violet-400 border border-zinc-700 hover:border-violet-700 hover:bg-violet-900/20 rounded-xl transition-colors"
                >
                  View details →
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}