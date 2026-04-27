import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { token, email, password } = await req.json();

    if (!token || !email || !password) {
      return NextResponse.json(
        { error: 'Token, email and password are required' },
        { status: 400 }
      );
    }

    // Check if token is valid and not expired
    const userResult = await db`
      SELECT * FROM users 
      WHERE email = ${email} 
      AND reset_token = ${token} 
      AND reset_expires > NOW()
    `;

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Hash the new password
    const password_hash = await bcrypt.hash(password, 12);

    // Update password and clear reset token
    await db`
      UPDATE users 
      SET password_hash = ${password_hash},
          reset_token = NULL,
          reset_expires = NULL
      WHERE email = ${email}
    `;

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
