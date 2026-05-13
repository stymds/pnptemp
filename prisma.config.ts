import { config as loadEnv } from 'dotenv';
import { defineConfig } from '@prisma/config';

loadEnv({ path: '.env' });
loadEnv({ path: '.env.local', override: true });

/**
 * Pick a URL Prisma migrate can use against Supabase.
 * The direct host (db.<ref>.supabase.co) is IPv6-only and unreliable on many
 * networks. The session pooler (aws-X-region.pooler.supabase.com:5432) is
 * IPv4 + supports session-scoped operations like advisory locks. So:
 *   1. If DATABASE_URL points at the transaction pooler (port 6543), derive
 *      the session-pooler URL by swapping port to 5432 and dropping the
 *      pgbouncer query string.
 *   2. Otherwise fall back to DIRECT_URL.
 */
function pickMigrateUrl(): string | undefined {
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    try {
      const u = new URL(databaseUrl);
      if (u.hostname.endsWith('.pooler.supabase.com') && u.port === '6543') {
        u.port = '5432';
        u.search = '';
        return u.toString();
      }
    } catch {
      // fall through to DIRECT_URL
    }
  }
  return process.env.DIRECT_URL;
}

const migrateUrl = pickMigrateUrl();

export default defineConfig({
  schema: 'prisma/schema.prisma',
  ...(migrateUrl ? { datasource: { url: migrateUrl } } : {}),
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
});
