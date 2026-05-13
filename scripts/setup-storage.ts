import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env' });
loadEnv({ path: '.env.local', override: true });

import { createClient } from '@supabase/supabase-js';

const BUCKET = 'products';

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set');

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) throw listErr;

  const existing = buckets?.find((b) => b.name === BUCKET);
  if (existing) {
    console.log(`Bucket '${BUCKET}' already exists (public=${existing.public}).`);
    if (!existing.public) {
      console.log("(Make it public in Supabase Studio so /storage/v1/object/public works.)");
    }
    return;
  }

  const { error: createErr } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ['image/webp', 'image/png', 'image/jpeg', 'image/avif'],
  });
  if (createErr) throw createErr;
  console.log(`Created public bucket '${BUCKET}'.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
