import { NextRequest, NextResponse } from 'next/server';
import { scrapeAllUpdates } from '@/lib/scraper';
import { db } from '@/lib/db';
import { sendUpdateEmail } from '@/lib/email';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const newUpdates = await scrapeAllUpdates();
  let insertedCount = 0;

  for (const update of newUpdates) {
    // Skip duplicates
    const existing = await db`SELECT hash FROM updates WHERE hash = ${update.hash}`;
    if (existing.length > 0) continue;

    // Insert new update with module field
    const insertResult = await db`
      INSERT INTO updates (
        title, description, full_synopsis, release_date, product,
        module, patch_version, official_news_url, docs_url, hash, created_at
      ) VALUES (
        ${update.title}, ${update.description}, ${update.full_synopsis},
        ${update.release_date}, ${update.product}, ${update.module},
        ${update.patch_version}, ${update.official_news_url}, ${update.docs_url},
        ${update.hash}, NOW()
      )
      RETURNING id
    `;
    const insertedId = insertResult[0].id;
    insertedCount++;

    // Notify matching subscribers
    // For FUSION: filter by product + selected modules
    // For OIC: filter by product only
    let users;

    if (update.product === 'FUSION' && update.module) {
      // Find users who selected FUSION and either:
      // (a) This module is in their selected modules, OR
      // (b) They selected FUSION but have no module restrictions (show all modules)
      users = await db`
        SELECT email FROM users
        WHERE subscribed = true
          AND preferences->'products' @> ${JSON.stringify(['FUSION'])}::jsonb
          AND (
            preferences->'fusionModules' @> ${JSON.stringify([update.module])}::jsonb
            OR jsonb_array_length(preferences->'fusionModules') = 0
          )
      `;
    } else if (update.product === 'OIC') {
      // For OIC, just filter by product (OIC has no module distinction)
      users = await db`
        SELECT email FROM users
        WHERE subscribed = true
          AND preferences->'products' @> ${JSON.stringify(['OIC'])}::jsonb
      `;
    } else {
      // Fallback: just match the product
      users = await db`
        SELECT email FROM users
        WHERE subscribed = true
          AND preferences->'products' @> ${JSON.stringify([update.product])}::jsonb
      `;
    }

    for (const user of users) {
      try {
        await sendUpdateEmail(user.email, { ...update, id: insertedId }, process.env.NEXTAUTH_URL!);
      } catch (err) {
        console.error(`Failed to email ${user.email}:`, err);
      }
    }
  }

  return NextResponse.json({ success: true, newUpdates: insertedCount });
}
