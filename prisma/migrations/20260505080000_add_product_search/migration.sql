-- Postgres full-text search column + GIN index for /search.
-- The `search` column is a generated tsvector; Prisma client ignores it
-- (no field in schema.prisma) but raw $queryRaw queries can use it directly.

ALTER TABLE "Product" ADD COLUMN search tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(name, '') || ' ' ||
      coalesce(tagline, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(badge, '')
    )
  ) STORED;

CREATE INDEX "Product_search_idx" ON "Product" USING gin(search);
