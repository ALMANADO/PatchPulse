import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  const { email, password, preferences } = await req.json();

  const existing = await db`SELECT email FROM users WHERE email = ${email}`;
  if (existing.length > 0) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 });
  }

  const password_hash = await bcrypt.hash(password, 12);
  const preferenceJson = JSON.stringify(preferences);

  try {
    // ✅ FIX: Insert user with proper error handling
    await db`
      INSERT INTO users (email, password_hash, preferences, subscribed, created_at)
      VALUES (${email}, ${password_hash}, ${preferenceJson}, true, NOW())
    `;

    // ✅ FIX: Verify admin registration succeeded
    if (email === process.env.ADMIN_EMAIL) {
      const verification = await db`SELECT email, preferences FROM users WHERE email = ${email}`;
      if (!verification.length) {
        console.error('❌ Admin registration failed - user not found after insert:', email);
        return NextResponse.json(
          { error: 'Admin registration failed - please try again' },
          { status: 500 }
        );
      }
      console.log('✅ Admin registered successfully:', {
        email: verification[0].email,
        preferences: verification[0].preferences
      });
    }
  } catch (err) {
    console.error('❌ Registration insert failed:', err);
    return NextResponse.json(
      { error: 'Registration failed - please try again' },
      { status: 500 }
    );
  }

  // Fetch latest 3 updates from DB for "in case you missed" section
  // ✅ Fixed: filter by the user's chosen products so they only see relevant updates
  let recentUpdates: any[] = [];
  try {
    recentUpdates = await db`
      SELECT id, title, product, patch_version, release_date FROM updates
      WHERE product = ANY(${preferences.products}::text[])
      ORDER BY release_date DESC LIMIT 3
    `;
  } catch (err) {
    console.warn('⚠️ Could not fetch recent updates for welcome email:', err);
  }

  try {
    await sendWelcomeEmail(email, recentUpdates, process.env.NEXTAUTH_URL!);
  } catch (err) {
    console.error('❌ Welcome email failed to send:', err);
  }

  return NextResponse.json({ success: true });
}