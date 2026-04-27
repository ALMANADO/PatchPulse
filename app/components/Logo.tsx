// Shared logo component — matches the favicon SVG exactly
export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width={size} height={size}>
      <rect width="32" height="32" rx="8" fill="#2563eb"/>
      <path d="M16 6 L24 10 L24 18 C24 22.4 20.4 26 16 26 C11.6 26 8 22.4 8 18 L8 10 Z" fill="white" opacity="0.9"/>
      <path d="M13 16 L15 18 L19 14" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}
