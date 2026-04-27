import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// 🔧 FIX: Add validation constants
const VALID_PRODUCTS = ['FUSION', 'OIC'];
const VALID_MODULES = ['Financials', 'HCM', 'Supply Chain', 'Customer Experience', 'Common Technologies'];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const result = await db`SELECT preferences FROM users WHERE email = ${session.user.email}`;
  return NextResponse.json(result[0]?.preferences || {});
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const preferences = await req.json();

  // 🔧 FIX: Validate preferences structure
  if (!preferences.products || !Array.isArray(preferences.products)) {
    return NextResponse.json(
      { error: 'Invalid preferences: products must be an array' },
      { status: 400 }
    );
  }

  // Validate each product is in the valid list
  for (const product of preferences.products) {
    if (!VALID_PRODUCTS.includes(product)) {
      return NextResponse.json(
        { error: `Invalid product: ${product}. Valid options are: ${VALID_PRODUCTS.join(', ')}` },
        { status: 400 }
      );
    }
  }

  // If FUSION is selected, validate fusionModules
  if (preferences.products.includes('FUSION')) {
    if (!Array.isArray(preferences.fusionModules)) {
      return NextResponse.json(
        { error: 'Invalid preferences: fusionModules must be an array when FUSION is selected' },
        { status: 400 }
      );
    }

    // Validate each module is in the valid list
    for (const module of preferences.fusionModules) {
      if (!VALID_MODULES.includes(module)) {
        return NextResponse.json(
          { error: `Invalid module: ${module}. Valid options are: ${VALID_MODULES.join(', ')}` },
          { status: 400 }
        );
      }
    }
  }

  // All validation passed, save preferences
  try {
    await db`UPDATE users SET preferences = ${JSON.stringify(preferences)} WHERE email = ${session.user.email}`;
    return NextResponse.json({ 
      success: true,
      preferences: preferences 
    });
  } catch (err) {
    console.error('Failed to update preferences:', err);
    return NextResponse.json(
      { error: 'Failed to save preferences' },
      { status: 500 }
    );
  }
}