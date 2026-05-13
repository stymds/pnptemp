-- Coupon type enum + table; Order discount columns.

CREATE TYPE "CouponType" AS ENUM ('PERCENT', 'FIXED_AMOUNT');

CREATE TABLE "Coupon" (
  "id"               TEXT          NOT NULL,
  "code"             TEXT          NOT NULL,
  "type"             "CouponType"  NOT NULL,
  "value"            INTEGER       NOT NULL,
  "minOrderPaise"    INTEGER,
  "maxDiscountPaise" INTEGER,
  "usageLimit"       INTEGER,
  "usageCount"       INTEGER       NOT NULL DEFAULT 0,
  "startsAt"         TIMESTAMP(3),
  "expiresAt"        TIMESTAMP(3),
  "isActive"         BOOLEAN       NOT NULL DEFAULT true,
  "createdAt"        TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP(3)  NOT NULL,
  CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");
CREATE INDEX "Coupon_code_idx" ON "Coupon"("code");

ALTER TABLE "Order" ADD COLUMN "couponCode" TEXT;
ALTER TABLE "Order" ADD COLUMN "discountPaise" INTEGER NOT NULL DEFAULT 0;
