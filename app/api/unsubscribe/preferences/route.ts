import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const result = await db`SELECT subscribed FROM users WHERE email = ${email}`;

    if (result.length === 0) {
      return NextResponse.json({ subscribed: true }, { status: 200 });
    }

    return NextResponse.json({ subscribed: result[0].subscribed }, { status: 200 });
  } catch (err) {
    console.error('Preferences fetch error:', err);
    return NextResponse.json({ subscribed: true }, { status: 200 });
  }
}
