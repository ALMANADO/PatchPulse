'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthLayout from '@/app/components/AuthLayout';
import {
  inputClass, labelClass, primaryBtnClass, cardClass, errorClass, Spinner,
} from '@/app/components/authPrimitives';

export default function ForgotPassword() {
  const [email, setEmail]   = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [error, setError]   = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? 'sent' : 'error');
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Something went wrong');
      }
    } catch {
      setStatus('error');
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <AuthLayout>
      <div className={cardClass}>
        {status === 'sent' ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-violet-900/40 border border-violet-700/50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">Check your inbox</h1>
            <p className="text-zinc-500 text-sm leading-relaxed mb-8">
              If <span className="text-zinc-300">{email}</span> has an account,
              you'll receive a reset link shortly.
            </p>
            <Link href="/login" className="text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors">
              ← Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-white tracking-tight">Reset your password</h1>
              <p className="text-zinc-500 text-sm mt-1">Enter your email and we'll send you a link.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
              </div>

              {status === 'error' && (
                <div className={errorClass}>
                  <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <button type="submit" disabled={status === 'loading'} className={primaryBtnClass}>
                {status === 'loading' ? <><Spinner /> Sending…</> : 'Send reset link'}
              </button>
            </form>

            <div className="border-t border-zinc-800 mt-7 pt-6 text-center">
              <Link href="/login" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
                ← Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
