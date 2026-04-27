import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// This single line forces Next.js to run this route at request time, never build time.
export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await db`SELECT * FROM updates ORDER BY release_date DESC LIMIT 30`;
  return NextResponse.json(result);
}
