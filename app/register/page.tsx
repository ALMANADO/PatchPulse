'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '@/app/components/AuthLayout';
import {
  inputClass, labelClass, primaryBtnClass, cardClass, errorClass,
  toggleBtnActive, toggleBtnInactive, Spinner, EyeIcon,
} from '@/app/components/authPrimitives';

const PRODUCTS = [
  { id: 'OIC',    label: 'OIC Gen 3',    icon: '☁️' },
  { id: 'FUSION', label: 'Fusion Cloud', icon: '🔗' },
] as const;

// Fusion modules available for filtering
const FUSION_MODULES = [
  { id: 'Financials',            label: 'Financials',            icon: '💰' },
  { id: 'HCM',                   label: 'HCM',                   icon: '👥' },
  { id: 'Supply Chain',          label: 'Supply Chain',          icon: '📦' },
  { id: 'Customer Experience',   label: 'Customer Experience',   icon: '🎯' },
  { id: 'Common Technologies',   label: 'Common Technologies',   icon: '⚙️' },
] as const;

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw]           = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [preferences, setPreferences] = useState({
    products:      ['OIC'] as ('OIC' | 'FUSION')[],
    fusionModules: [] as ('Financials' | 'HCM' | 'Supply Chain' | 'Customer Experience' | 'Common Technologies')[],
    frequency:     'instant' as const,
  });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const toggleProduct = (id: 'OIC' | 'FUSION') =>
    setPreferences(p => ({
      ...p,
      products: p.products.includes(id) ? p.products.filter(x => x !== id) : [...p.products, id],
    }));

  const toggleFusionModule = (id: 'Financials' | 'HCM' | 'Supply Chain' | 'Customer Experience' | 'Common Technologies') =>
    setPreferences(p => ({
      ...p,
      fusionModules: p.fusionModules.includes(id)
        ? p.fusionModules.filter(x => x !== id)
        : [...p.fusionModules, id],
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    if (form.password.length < 8) return setError('Password must be at least 8 characters');
    if (preferences.products.length === 0) return setError('Select at least one product to monitor');
    if (preferences.products.includes('FUSION') && preferences.fusionModules.length === 0) {
      return setError('Select at least one Fusion module');
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, preferences }),
      });

      if (res.ok) {
        const result = await signIn('credentials', {
          email: form.email,
          password: form.password,
          redirect: false,
        });
        router.push(result?.ok ? '/dashboard' : '/login?registered=1');
      } else {
        const data = await res.json();
        setError(data.error || 'Registration failed. Please try again.');
        setLoading(false);
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <AuthLayout maxWidth="lg">
      <div className={cardClass}>
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white tracking-tight">Create your account</h1>
          <p className="text-zinc-500 text-sm mt-1">Start monitoring Oracle patches in minutes</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className={inputClass}
              placeholder="you@company.com"
              autoComplete="email"
              required
            />
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className={`${inputClass} pr-11`}
                  minLength={8}
                  autoComplete="new-password"
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
            <div>
              <label className={labelClass}>Confirm</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  className={`${inputClass} pr-11`}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  tabIndex={-1}
                >
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <label className={labelClass}>Products to monitor</label>
            <div className="flex gap-2 mt-1">
              {PRODUCTS.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleProduct(p.id)}
                  className={`flex-1 py-2.5 px-4 rounded-xl border text-sm font-medium transition-colors flex items-center justify-center gap-2
                    ${preferences.products.includes(p.id) ? toggleBtnActive : toggleBtnInactive}`}
                >
                  <span>{p.icon}</span> {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fusion Modules (only show if FUSION selected) */}
          {preferences.products.includes('FUSION') && (
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 space-y-3">
              <label className={labelClass}>Fusion modules to track</label>
              <p className="text-xs text-zinc-500 mb-2">
                Choose which Oracle Fusion modules you want to monitor. Updates from selected modules will appear in your library and trigger alerts.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {FUSION_MODULES.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleFusionModule(m.id)}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium transition-colors flex items-center justify-center gap-2
                      ${preferences.fusionModules.includes(m.id) ? toggleBtnActive : toggleBtnInactive}`}
                  >
                    <span>{m.icon}</span> {m.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Frequency note */}
          <div>
            <label className={labelClass}>Alert frequency</label>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-400">
              Instant alerts — all updates from your selected products/modules will be delivered immediately
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
            {loading ? <><Spinner /> Creating account…</> : 'Create account & start monitoring'}
          </button>
        </form>

        <div className="border-t border-zinc-800 mt-7 pt-6 text-center">
          <p className="text-zinc-500 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
