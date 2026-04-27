'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '@/app/components/AuthLayout';
import {
  inputClass, labelClass, primaryBtnClass, cardClass, errorClass, Spinner,
} from '@/app/components/authPrimitives';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [status, setStatus]     = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError]       = useState('');

  if (!token || !email) {
    return (
      <div className={cardClass}>
        <div className="text-center py-4">
          <h1 className="text-xl font-semibold text-white mb-3">Invalid reset link</h1>
          <p className="text-zinc-500 text-sm mb-6">
            This link is missing required parameters. Please request a new password reset.
          </p>
          <Link href="/forgot-password" className="text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors">
            Request new link →
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. The link may have expired.');
        setStatus('error');
      } else {
        setStatus('success');
        setTimeout(() => router.push('/login'), 2500);
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className={cardClass}>
        <div className="text-center py-4">
          <div className="w-14 h-14 bg-green-900/40 border border-green-700/50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">Password reset!</h1>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Your password has been updated. Redirecting you to sign in…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cardClass}>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white tracking-tight">Set new password</h1>
        <p className="text-zinc-500 text-sm mt-1">Choose a strong password for your account.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className={labelClass}>New password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={inputClass}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            required
            minLength={8}
          />
        </div>

        <div>
          <label className={labelClass}>Confirm password</label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className={inputClass}
            placeholder="Repeat your new password"
            autoComplete="new-password"
            required
          />
        </div>

        {(status === 'error' || error) && (
          <div className={errorClass}>
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className={primaryBtnClass}
        >
          {status === 'loading' ? <><Spinner /> Updating password…</> : 'Reset password'}
        </button>
      </form>

      <div className="border-t border-zinc-800 mt-7 pt-6 text-center">
        <Link href="/login" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
          ← Back to sign in
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin w-5 h-5 border-2 border-zinc-700 border-t-violet-500 rounded-full" />
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
