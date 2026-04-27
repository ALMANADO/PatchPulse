// app/components/AuthLayout.tsx
import Link from 'next/link';
import Logo from '@/app/components/Logo';

interface AuthLayoutProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
}

export default function AuthLayout({ children, maxWidth = 'md' }: AuthLayoutProps) {
  const widthClass = maxWidth === 'sm' ? 'max-w-sm' : maxWidth === 'lg' ? 'max-w-lg' : 'max-w-md';

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Subtle dot grid — same as landing page */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(99,102,241,0.12) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      {/* Top glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(109,40,217,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Nav bar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-screen-xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2.5 group">
          {/* ✅ Fixed: use shared Logo component instead of hardcoded purple "P" div */}
          <Logo size={32} />
          <span className="text-white font-semibold tracking-tight text-sm">PatchPulse</span>
        </Link>
      </nav>

      {/* Content */}
      <div className={`relative z-10 flex-1 flex items-center justify-center px-4 py-8`}>
        <div className={`${widthClass} w-full`}>
          {children}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center">
        <p className="text-zinc-600 text-xs">
          © {new Date().getFullYear()} PatchPulse · Oracle patch monitoring
        </p>
      </footer>
    </div>
  );
}
