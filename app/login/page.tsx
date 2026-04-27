'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '@/app/components/AuthLayout';
import {
  inputClass, labelClass, primaryBtnClass, cardClass, errorClass,
  Spinner, EyeIcon,
} from '@/app/components/authPrimitives';

export default function Login() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.ok) {
        router.push('/dashboard');
        return; // keep spinner while navigating
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className={cardClass}>
        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white tracking-tight">Welcome back</h1>
          <p className="text-zinc-500 text-sm mt-1">Sign in to your PatchPulse account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@company.com"
              autoComplete="email"
              required
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={labelClass} style={{ marginBottom: 0 }}>Password</label>
              <Link
                href="/forgot-password"
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} pr-11`}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                tabIndex={-1}
              >
                <EyeIcon open={showPw} />
              </button>
            </div>
          </div>

          {error && (
            <div className={errorClass}>
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className={`${primaryBtnClass} mt-2`}>
            {loading ? <><Spinner /> Signing in…</> : 'Sign in'}
          </button>
        </form>

        {/* Divider */}
        <div className="border-t border-zinc-800 mt-7 pt-6 text-center">
          <p className="text-zinc-500 text-sm">
            Don't have an account?{' '}
            <Link href="/register" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
