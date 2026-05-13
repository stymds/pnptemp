import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env' });
loadEnv({ path: '.env.local', override: true });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { products as productSeed, categories as categorySeed } from './seed-data';

if (!process.env.DIRECT_URL) {
  throw new Error('DIRECT_URL is not set. Add it to .env.local before seeding.');
}

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

const rupeesToPaise = (n: number) => Math.round(n * 100);

function parseStockUnits(s: string): number {
  const m = s.match(/(\d+)\s*units?/i);
  if (m) return parseInt(m[1], 10);
  return /in stock/i.test(s) ? 5 : 0;
}

const categoryNameToSlug: Record<string, string> = {
  Mirrorless: 'mirrorless',
  DSLR: 'dslr',
  Lenses: 'lenses',
  Compact: 'compact',
  Cinema: 'cine',
  Flashes: 'flashes',
  Printers: 'printers',
  Accessories: 'accessories',
};

async function main() {
  for (const c of categorySeed) {
    await prisma.category.upsert({
      where: { slug: c.id },
      update: { name: c.name },
      create: { slug: c.id, name: c.name },
    });
  }

  for (const p of productSeed) {
    const slug = categoryNameToSlug[p.category] ?? 'accessories';
    const category = await prisma.category.findUniqueOrThrow({ where: { slug } });

    const fields = {
      name: p.name,
      tagline: p.tagline,
      categoryId: category.id,
      pricePaise: rupeesToPaise(p.price),
      mrpPaise: rupeesToPaise(p.mrp),
      emi: p.emi || null,
      stockUnits: parseStockUnits(p.stock),
      rating: p.rating,
      reviewsCount: p.reviews,
      badge: p.badge || null,
      swatch: p.swatch || null,
      sourceUrl: p.sourceUrl || null,
      sourceNote: p.sourceNote || null,
    };

    const product = await prisma.product.upsert({
      where: { slug: p.id },
      update: fields,
      create: { slug: p.id, ...fields },
    });

    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    const gallery =
      p.gallery && p.gallery.length > 0
        ? p.gallery
        : [{ src: p.image, alt: p.imageAlt, label: 'main' }];
    for (let i = 0; i < gallery.length; i++) {
      const g = gallery[i];
      await prisma.productImage.create({
        data: {
          productId: product.id,
          storagePath: g.src,
          alt: g.alt,
          label: g.label,
          position: i,
        },
      });
    }
  }

  console.log(`Seed complete: ${categorySeed.length} categories, ${productSeed.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
