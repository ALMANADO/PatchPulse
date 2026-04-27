/**
 * Shared primitive class strings for auth forms.
 * Import these constants so every auth page uses identical styling.
 */

export const inputClass =
  'w-full bg-zinc-900 border border-zinc-700 hover:border-zinc-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-500 outline-none transition-colors';

export const labelClass = 'block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide';

export const primaryBtnClass =
  'w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98] text-white py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-violet-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';

export const ghostBtnClass =
  'w-full border border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-white py-3 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2';

export const cardClass =
  'bg-zinc-900 border border-zinc-800 rounded-2xl p-8';

export const dividerClass = 'border-t border-zinc-800 my-6';

export const errorClass =
  'flex items-start gap-2 bg-red-950/50 border border-red-800/60 text-red-400 text-sm rounded-xl px-4 py-3';

export const toggleBtnActive =
  'bg-violet-600 text-white border-violet-600';

export const toggleBtnInactive =
  'bg-transparent border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200';

export function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.772M9.878 9.878l4.244 4.244M9.878 9.878L3 3m6.878 6.878L21 21" />
    </svg>
  );
}
