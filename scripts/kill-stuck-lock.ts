import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env' });
loadEnv({ path: '.env.local', override: true });

import { Client } from 'pg';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL not set');

  const client = new Client({ connectionString: url });
  await client.connect();

  // Find any session holding the Prisma migrate advisory lock and terminate it.
  const result = await client.query<{ pid: number; terminated: boolean }>(`
    SELECT pid, pg_terminate_backend(pid) AS terminated
    FROM pg_locks
    WHERE locktype = 'advisory' AND objid = 72707369
  `);

  console.log('Killed sessions:', result.rows);
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
