import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { scrapeAllUpdates } from '@/lib/scraper';
import { db } from '@/lib/db';
import { sendUpdateEmail } from '@/lib/email';

export async function POST() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     API: /api/admin/trigger-scrape - REQUEST STARTED       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

 const session = await getServerSession(authOptions);

  // Explicitly check for null session OR email mismatch to satisfy TypeScript
  if (!session || !session.user || session.user.email !== process.env.ADMIN_EMAIL) {
    console.error('[TRIGGER-SCRAPE] ✗ Unauthorized: User is not admin or no session');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Now TypeScript knows session and session.user definitely exist
  console.log(`[TRIGGER-SCRAPE] ✓ Admin authenticated: ${session.user.email}`);
  console.log(`[TRIGGER-SCRAPE] Starting scrapeAllUpdates()...`);

  const newUpdates = await scrapeAllUpdates();
  
  console.log(`[TRIGGER-SCRAPE] ✓ scrapeAllUpdates() returned ${newUpdates.length} updates`);
  
  if (newUpdates.length === 0) {
    console.warn(`[TRIGGER-SCRAPE] ⚠️  WARNING: Scraper returned 0 updates`);
    return NextResponse.json({ 
      success: true, 
      newUpdates: 0,
      warning: 'Scraper returned 0 updates. Check logs for details.'
    });
  }

  let insertedCount = 0;
  let duplicateCount = 0;
  let emailErrorCount = 0;

  console.log(`[TRIGGER-SCRAPE] Processing ${newUpdates.length} updates for insertion...`);

  for (const update of newUpdates) {
    try {
      const existing = await db`SELECT hash FROM updates WHERE hash = ${update.hash}`;
      if (existing.length > 0) {
        console.log(`[TRIGGER-SCRAPE] [${update.title.substring(0, 50)}...] ⊘ Duplicate (hash: ${update.hash})`);
        duplicateCount++;
        continue;
      }

      console.log(`[TRIGGER-SCRAPE] [${update.title.substring(0, 50)}...] Inserting...`);

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
      
      console.log(`[TRIGGER-SCRAPE]   ✓ Inserted with ID: ${insertedId}`);

      // Notify matching subscribers
      // For FUSION: filter by product + selected modules
      // For OIC: filter by product only
      let users;

      if (update.product === 'FUSION' && update.module) {
        console.log(`[TRIGGER-SCRAPE]   └─ Finding subscribers for FUSION/${update.module}...`);
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
        console.log(`[TRIGGER-SCRAPE]   └─ Found ${users.length} matching subscribers`);
      } else if (update.product === 'OIC') {
        console.log(`[TRIGGER-SCRAPE]   └─ Finding subscribers for OIC...`);
        // For OIC, just filter by product (OIC has no module distinction)
        users = await db`
          SELECT email FROM users
          WHERE subscribed = true
            AND preferences->'products' @> ${JSON.stringify(['OIC'])}::jsonb
        `;
        console.log(`[TRIGGER-SCRAPE]   └─ Found ${users.length} matching subscribers`);
      } else {
        console.log(`[TRIGGER-SCRAPE]   └─ Finding subscribers for ${update.product}...`);
        // Fallback: just match the product
        users = await db`
          SELECT email FROM users
          WHERE subscribed = true
            AND preferences->'products' @> ${JSON.stringify([update.product])}::jsonb
        `;
        console.log(`[TRIGGER-SCRAPE]   └─ Found ${users.length} matching subscribers`);
      }

      for (const user of users) {
        try {
          console.log(`[TRIGGER-SCRAPE]       Sending email to ${user.email}...`);
          await sendUpdateEmail(user.email, { ...update, id: insertedId }, process.env.NEXTAUTH_URL!);
          console.log(`[TRIGGER-SCRAPE]       ✓ Email sent`);
        } catch (err) {
          emailErrorCount++;
          console.error(`[TRIGGER-SCRAPE]       ✗ Failed to email ${user.email}:`, err instanceof Error ? err.message : err);
        }
      }
    } catch (err) {
      console.error(`[TRIGGER-SCRAPE] ✗ Error processing update "${update.title}":`, err instanceof Error ? err.message : err);
    }
  }

  console.log(`\n╔════════════════════════════════════════════════════════════╗`);
  console.log(`║            TRIGGER-SCRAPE COMPLETION SUMMARY              ║`);
  console.log(`╚════════════════════════════════════════════════════════════╝`);
  console.log(`Processed:     ${newUpdates.length}`);
  console.log(`Inserted:      ${insertedCount}`);
  console.log(`Duplicates:    ${duplicateCount}`);
  console.log(`Email Errors:  ${emailErrorCount}`);
  console.log(`═══════════════════════════════════════════════════════════════\n`);

  return NextResponse.json({ 
    success: true, 
    newUpdates: insertedCount,
    processed: newUpdates.length,
    duplicates: duplicateCount,
    emailErrors: emailErrorCount
  });
}
