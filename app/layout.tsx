import type { Metadata } from 'next';
import './globals.css';
import Providers from './components/Providers';

export const metadata: Metadata = {
  title: 'PatchPulse - Oracle Patch Monitoring',
  description: 'Real-time alerts for Oracle Integration Cloud and Fusion patches.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' }, // Explicitly tells the browser it's an SVG
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg', // Important for Apple devices and some high-res monitors
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
