import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env' });
loadEnv({ path: '.env.local', override: true });

import crypto from 'node:crypto';
import { readFileSync } from 'node:fs';
import { Client } from 'pg';

const MIGRATION_NAME = '20260507120000_add_coupons';
const MIGRATION_PATH = `prisma/migrations/${MIGRATION_NAME}/migration.sql`;

async function main() {
  const sql = readFileSync(MIGRATION_PATH, 'utf8');
  const checksum = crypto.createHash('sha256').update(sql).digest('hex');

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const recorded = await client.query(
    `SELECT 1 FROM _prisma_migrations WHERE migration_name = $1`,
    [MIGRATION_NAME],
  );

  // Apply schema (idempotent guards).
  await client.query(`DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CouponType') THEN
      CREATE TYPE "CouponType" AS ENUM ('PERCENT', 'FIXED_AMOUNT');
    END IF;
  END $$;`);

  await client.query(`CREATE TABLE IF NOT EXISTS "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "CouponType" NOT NULL,
    "value" INTEGER NOT NULL,
    "minOrderPaise" INTEGER,
    "maxDiscountPaise" INTEGER,
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
  )`);

  await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "Coupon_code_key" ON "Coupon"("code")`);
  await client.query(`CREATE INDEX IF NOT EXISTS "Coupon_code_idx" ON "Coupon"("code")`);

  await client.query(`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "couponCode" TEXT`);
  await client.query(`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "discountPaise" INTEGER NOT NULL DEFAULT 0`);

  if (!recorded.rowCount) {
    const id = crypto.randomUUID();
    const now = new Date();
    await client.query(
      `INSERT INTO _prisma_migrations
         (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
       VALUES ($1, $2, $3, $4, NULL, NULL, $5, 1)`,
      [id, checksum, now, MIGRATION_NAME, now],
    );
    console.log(`Recorded migration ${MIGRATION_NAME}`);
  } else {
    console.log(`Migration ${MIGRATION_NAME} already recorded; schema synced (idempotent).`);
  }

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
