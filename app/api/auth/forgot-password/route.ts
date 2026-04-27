import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendResetEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check the user exists before doing anything
    const userResult = await db`SELECT email FROM users WHERE email = ${email}`;
    if (userResult.length === 0) {
      // Return success anyway — don't reveal whether the email is registered
      return NextResponse.json({ success: true });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000).toISOString(); // 1 hour from now

    await db`
      UPDATE users
      SET reset_token = ${token},
          reset_expires = ${expires}
      WHERE email = ${email}
    `;

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    await sendResetEmail(email, resetUrl);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
