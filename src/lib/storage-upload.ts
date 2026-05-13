import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _admin: SupabaseClient | null = null;

function admin(): SupabaseClient {
  if (_admin) return _admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set');
  }
  _admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _admin;
}

export const PRODUCTS_BUCKET = 'products';

const ALLOWED_TYPES = new Set(['image/webp', 'image/png', 'image/jpeg', 'image/avif']);
const MAX_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Uploads an image file under the `products` bucket and returns the storage
 * key (suitable for ProductImage.storagePath). Path format: <productId>/<uuid>.<ext>
 */
export async function uploadProductImage(productId: string, file: File): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error(`Unsupported image type: ${file.type}. Use WebP, PNG, JPEG, or AVIF.`);
  }
  if (file.size > MAX_BYTES) {
    throw new Error(`Image too large (${Math.round(file.size / 1024 / 1024)}MB). Max ${MAX_BYTES / 1024 / 1024}MB.`);
  }

  const ext = (file.name.split('.').pop() || 'webp').toLowerCase().replace(/[^a-z0-9]/g, '');
  const key = `${productId}/${crypto.randomUUID()}.${ext || 'webp'}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await admin()
    .storage.from(PRODUCTS_BUCKET)
    .upload(key, buffer, { contentType: file.type, upsert: false });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  return key;
}

/**
 * Delete a product image from Supabase Storage. /public-path entries are
 * left alone so we don't clobber transition data.
 */
export async function deleteProductImage(storagePath: string): Promise<void> {
  if (!storagePath || storagePath.startsWith('/') || storagePath.startsWith('http')) return;
  const { error } = await admin().storage.from(PRODUCTS_BUCKET).remove([storagePath]);
  if (error) console.error('Storage delete failed', error);
}
