'use client';

import { signOut } from 'next-auth/react';

export default function DashboardActions() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="text-xs font-medium text-zinc-500 hover:text-red-400 transition-colors"
    >
      Sign out
    </button>
  );
}
