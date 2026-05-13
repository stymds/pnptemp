import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env' });
loadEnv({ path: '.env.local', override: true });

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { Client } from 'pg';

const BUCKET = 'products';
const PUBLIC_PREFIX = '/images/products/';
const PUBLIC_DIR = path.join(process.cwd(), 'public', 'images', 'products');

function contentType(file: string) {
  const ext = file.split('.').pop()?.toLowerCase();
  if (ext === 'webp') return 'image/webp';
  if (ext === 'png') return 'image/png';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'avif') return 'image/avif';
  return 'application/octet-stream';
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const dbUrl = process.env.DATABASE_URL;
  if (!url || !serviceKey || !dbUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / DATABASE_URL must be set');
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const db = new Client({ connectionString: dbUrl });
  await db.connect();

  const rows = await db.query<{
    id: string;
    storagePath: string;
  }>(`SELECT id, "storagePath" FROM "ProductImage" WHERE "storagePath" LIKE $1`, [
    `${PUBLIC_PREFIX}%`,
  ]);

  if (rows.rowCount === 0) {
    console.log('Nothing to migrate — no rows with /public path prefix.');
    await db.end();
    return;
  }

  console.log(`Migrating ${rows.rowCount} image rows…`);

  let uploaded = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of rows.rows) {
    const filename = row.storagePath.slice(PUBLIC_PREFIX.length);
    const localPath = path.join(PUBLIC_DIR, filename);

    if (!existsSync(localPath)) {
      console.warn(`  ! missing on disk, skipping: ${row.storagePath}`);
      skipped++;
      continue;
    }

    const buffer = readFileSync(localPath);
    const key = filename; // top-level in bucket, matches new admin uploads pattern enough

    const { error: uploadErr } = await supabase
      .storage.from(BUCKET)
      .upload(key, buffer, { contentType: contentType(filename), upsert: true });

    if (uploadErr) {
      console.error(`  x upload failed for ${filename}: ${uploadErr.message}`);
      skipped++;
      continue;
    }
    uploaded++;

    await db.query(
      `UPDATE "ProductImage" SET "storagePath" = $1 WHERE id = $2`,
      [key, row.id],
    );
    updated++;
    console.log(`  ✓ ${filename}`);
  }

  await db.end();
  console.log(`\nDone. Uploaded: ${uploaded}, DB rows updated: ${updated}, skipped: ${skipped}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
