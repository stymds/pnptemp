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
}

export interface Editorial {
  id: string;
  kicker: string;
  title: string;
  read: string;
}

export const categories = [
  { id: 'mirrorless', name: 'Mirrorless', count: 24 },
  { id: 'dslr', name: 'DSLR', count: 18 },
  { id: 'lenses', name: 'Lenses', count: 62 },
  { id: 'compact', name: 'Compact', count: 9 },
  { id: 'cine', name: 'Cinema', count: 7 },
  { id: 'flashes', name: 'Flashes', count: 14 },
  { id: 'printers', name: 'Printers', count: 11 },
  { id: 'accessories', name: 'Accessories', count: 140 },
];

export const products: Product[] = [
  {
    id: 'eos-r5-mk2',
    name: 'EOS R5 Mark II',
    category: 'Mirrorless',
    tagline: 'Full-frame · 45MP · 8K RAW',
    price: 339990,
    mrp: 359990,
    emi: 'From ₹14,166/mo · 24 mo',
    rating: 4.9,
    reviews: 142,
    badge: 'New',
    stock: 'In stock · 3 units',
    swatch: '#1a1a1a',
  },
  {
    id: 'eos-r6-mk2',
    name: 'EOS R6 Mark II',
    category: 'Mirrorless',
    tagline: 'Full-frame · 24.2MP · 40 fps',
    price: 219990,
    mrp: 234990,
    emi: 'From ₹9,166/mo · 24 mo',
    rating: 4.8,
    reviews: 218,
    stock: 'In stock',
    swatch: '#1a1a1a',
  },
  {
    id: 'eos-r8',
    name: 'EOS R8',
    category: 'Mirrorless',
    tagline: 'Full-frame · 24.2MP · Compact',
    price: 149990,
    mrp: 159990,
    emi: 'From ₹6,250/mo',
    rating: 4.7,
    reviews: 96,
    badge: 'Bestseller',
    stock: 'In stock',
    swatch: '#202020',
  },
  {
    id: 'eos-r50',
    name: 'EOS R50',
    category: 'Mirrorless',
    tagline: 'APS-C · 24.2MP · Creator',
    price: 76990,
    mrp: 82990,
    emi: 'From ₹3,208/mo',
    rating: 4.6,
    reviews: 341,
    stock: 'In stock',
    swatch: '#f2ede4',
  },
  {
    id: 'eos-5d-mk4',
    name: 'EOS 5D Mark IV',
    category: 'DSLR',
    tagline: 'Full-frame · 30.4MP · DSLR',
    price: 259990,
    mrp: 279990,
    emi: 'From ₹10,833/mo',
    rating: 4.8,
    reviews: 512,
    stock: 'In stock · 2 units',
    swatch: '#121212',
  },
  {
    id: 'rf-24-70',
    name: 'RF 24–70mm f/2.8L IS USM',
    category: 'Lenses',
    tagline: 'Standard zoom · L-series',
    price: 219990,
    mrp: 229990,
    emi: 'From ₹9,166/mo',
    rating: 4.9,
    reviews: 184,
    stock: 'In stock',
    swatch: '#1a1a1a',
  },
  {
    id: 'rf-70-200',
    name: 'RF 70–200mm f/2.8L IS',
    category: 'Lenses',
    tagline: 'Telephoto zoom · L-series',
    price: 239990,
    mrp: 249990,
    emi: 'From ₹10,000/mo',
    rating: 4.9,
    reviews: 211,
    badge: 'Pro pick',
    stock: 'In stock',
    swatch: '#1a1a1a',
  },
  {
    id: 'rf-50-f18',
    name: 'RF 50mm f/1.8 STM',
    category: 'Lenses',
    tagline: 'Prime · Nifty fifty',
    price: 16990,
    mrp: 18990,
    emi: 'From ₹708/mo',
    rating: 4.8,
    reviews: 932,
    badge: 'Bestseller',
    stock: 'In stock',
    swatch: '#1a1a1a',
  },
  {
    id: 'speedlite-470',
    name: 'Speedlite EL-5',
    category: 'Flashes',
    tagline: 'Wireless · TTL · GN60',
    price: 59990,
    mrp: 62990,
    emi: 'From ₹2,500/mo',
    rating: 4.7,
    reviews: 58,
    stock: 'In stock',
    swatch: '#242424',
  },
  {
    id: 'selphy-qx20',
    name: 'SELPHY Square QX20',
    category: 'Printers',
    tagline: 'Instant prints · Square format',
    price: 18990,
    mrp: 20990,
    emi: 'From ₹790/mo',
    rating: 4.5,
    reviews: 74,
    stock: 'In stock',
    swatch: '#ecd9c3',
  },
  {
    id: 'bg-gadget',
    name: 'Gadget Bag 2400',
    category: 'Accessories',
    tagline: 'Weather-resistant · Medium',
    price: 4990,
    mrp: 5990,
    emi: '',
    rating: 4.4,
    reviews: 212,
    stock: 'In stock',
    swatch: '#3a2f25',
  },
  {
    id: 'lp-e6nh',
    name: 'LP-E6NH Battery',
    category: 'Accessories',
    tagline: 'Rechargeable · 2130mAh',
    price: 8990,
    mrp: 9490,
    emi: '',
    rating: 4.7,
    reviews: 406,
    stock: 'In stock',
    swatch: '#1a1a1a',
  },
];

export const editorial: Editorial[] = [
  { id: 'e1', kicker: 'Buying guide', title: 'Choosing your first full-frame', read: '8 min read' },
  { id: 'e2', kicker: 'Workshop', title: 'Street photography with primes', read: '12 min read' },
  { id: 'e3', kicker: 'Field notes', title: 'A week in the Himalayas with the R5 II', read: '6 min read' },
];

export function formatINR(n: number): string {
  return '₹' + n.toLocaleString('en-IN');
}
