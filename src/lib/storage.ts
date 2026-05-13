const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const BUCKET = 'products';

/**
 * Convert a ProductImage.storagePath into a usable image src.
 * Handles three forms:
 *   - "/images/products/foo.webp" — local /public path (transition); pass through
 *   - "https://..." — already an absolute URL; pass through
 *   - "foo.webp" or "subdir/foo.webp" — Supabase Storage object key
 */
export function productImageSrc(storagePath: string | null | undefined): string {
  if (!storagePath) return '';
  if (storagePath.startsWith('/') || storagePath.startsWith('http')) return storagePath;
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}
