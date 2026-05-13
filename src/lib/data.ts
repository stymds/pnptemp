// Shared types + display helpers. Product/category data now lives in Postgres
// (see src/lib/products.ts). Editorial is still static demo content.

export interface ProductImageAsset {
  src: string;
  alt: string;
  label: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  tagline: string;
  price: number;
  mrp: number;
  emi: string;
  rating: number;
  reviews: number;
  badge?: string;
  stock: string;
  swatch: string;
  image: string;
  imageAlt: string;
  sourceUrl: string;
  sourceNote?: string;
  gallery?: ProductImageAsset[];
}

export interface Editorial {
  id: string;
  kicker: string;
  title: string;
  read: string;
}

export const editorial: Editorial[] = [
  { id: 'e1', kicker: 'Buying guide', title: 'Choosing your first full-frame', read: '8 min read' },
  { id: 'e2', kicker: 'Workshop', title: 'Street photography with primes', read: '12 min read' },
  { id: 'e3', kicker: 'Field notes', title: 'A week in the Himalayas with the R5 II', read: '6 min read' },
];

export function formatINR(n: number): string {
  return 'Rs. ' + n.toLocaleString('en-IN');
}
