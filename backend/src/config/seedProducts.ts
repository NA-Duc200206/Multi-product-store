import fs from 'fs';
import path from 'path';
import { Types } from 'mongoose';

export type CategoryKey =
  | 'laptopsTablets'
  | 'monitorsDesk'
  | 'audio'
  | 'chargingStorage'
  | 'watches'
  | 'bagsLuggage'
  | 'eyewearJewelry'
  | 'topsShirts'
  | 'outerwear'
  | 'bottomsDresses'
  | 'skincare'
  | 'fragrance'
  | 'makeupHair'
  | 'kitchenCoffee'
  | 'homeLiving';

export type SeedCategoryMap = Record<CategoryKey, { _id: Types.ObjectId }>;

interface ProductTemplate {
  name: string;
  slug: string;
  price: number;
  stock: number;
  description: string;
  image: string;
  colors: string[];
  sizes: string[];
  categoryKey: CategoryKey;
}

const IMAGE_POOLS: Record<CategoryKey, string[]> = {
  laptopsTablets: [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800',
  ],
  monitorsDesk: [
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=800',
  ],
  audio: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&q=80&w=800',
  ],
  chargingStorage: [
    'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=800',
  ],
  watches: [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=800',
  ],
  bagsLuggage: [
    'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800',
  ],
  eyewearJewelry: [
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800',
  ],
  topsShirts: [
    'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800',
  ],
  outerwear: [
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800',
  ],
  bottomsDresses: [
    'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800',
  ],
  skincare: [
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800',
  ],
  fragrance: [
    'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800',
  ],
  makeupHair: [
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800',
  ],
  kitchenCoffee: [
    'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800',
  ],
  homeLiving: [
    'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800',
  ],
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const EDITION_SUFFIXES = [
  '',
  'Pro Edition',
  'Studio Series',
  '2026 Edition',
  'Signature Line',
  'Reserve',
  'Compact',
  'Plus',
  'Essential',
  'Limited',
  'Atelier',
  'Classic',
];

let cachedDynamicPools: Partial<Record<CategoryKey, string[]>> | null = null;

function loadUnsplashPools(): Partial<Record<CategoryKey, string[]>> {
  if (cachedDynamicPools) return cachedDynamicPools;
  const candidates = [
    path.join(__dirname, 'unsplashPools.json'),
    path.resolve(process.cwd(), 'src/config/unsplashPools.json'),
  ];
  for (const filePath of candidates) {
    try {
      if (fs.existsSync(filePath)) {
        const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (parsed && typeof parsed === 'object') {
          const typed = parsed as Partial<Record<CategoryKey, string[]>>;
          cachedDynamicPools = typed;
          return typed;
        }
      }
    } catch {
      // Ignore invalid JSON and fall back to static IMAGE_POOLS
    }
  }
  cachedDynamicPools = {};
  return cachedDynamicPools;
}

/**
 * Generates targetCount unique products per category (67 * 15 = 1,005 products)
 * by combining curated base items with edition/series suffixes.
 */
function buildGroup(
  categoryKey: CategoryKey,
  baseNames: string[],
  basePrice: number,
  priceStep: number,
  colorsList: string[][],
  sizesList: string[][],
  descPrefix: string,
  targetCount = 67
): ProductTemplate[] {
  const dynamicPools = loadUnsplashPools();
  const dynamic = dynamicPools[categoryKey];
  const pool = Array.isArray(dynamic) && dynamic.length > 0 ? dynamic : IMAGE_POOLS[categoryKey];
  const results: ProductTemplate[] = [];
  const usedSlugs = new Set<string>();

  let idx = 0;
  for (let round = 0; round < EDITION_SUFFIXES.length && results.length < targetCount; round++) {
    const suffix = EDITION_SUFFIXES[round];
    for (let b = 0; b < baseNames.length && results.length < targetCount; b++) {
      const base = baseNames[b];
      const name = suffix ? `${base} — ${suffix}` : base;
      const slug = slugify(name);
      if (usedSlugs.has(slug)) continue;
      usedSlugs.add(slug);

      const stock = idx % 17 === 0 ? 0 : 6 + ((idx * 7) % 60);
      const price = basePrice + ((idx * 3 + round * 2) % 14) * priceStep;

      results.push({
        name,
        slug,
        price,
        stock,
        description: `${descPrefix} ${name} combines refined materials, reliable everyday performance, and UCONEXT quality assurance.`,
        image: pool[idx % pool.length],
        colors: colorsList[idx % colorsList.length],
        sizes: sizesList[idx % sizesList.length],
        categoryKey,
      });
      idx++;
    }
  }

  return results;
}

// Mapping for legacy 27 products in seed.ts -> 15 specific categories
export const LEGACY_SLUG_CATEGORY_MAP: Record<string, CategoryKey> = {
  'dior-addict-lip-glow-lip-balm': 'makeupHair',
  'chanel-bleu-de-chanel-edp-perfume': 'fragrance',
  'the-ordinary-niacinamide-10-zinc-1-serum': 'skincare',
  'la-roche-posay-anthelios-sunscreen-50ml': 'skincare',
  'mac-matte-lipstick-chili': 'makeupHair',
  'kiehls-calendula-deep-cleansing-foaming-face-wash': 'skincare',
  'minimalist-cotton-t-shirt': 'topsShirts',
  'zara-floral-maxi-dress': 'bottomsDresses',
  'levis-501-original-fit-jeans': 'bottomsDresses',
  'uniqlo-uv-protection-hoodie': 'outerwear',
  'mango-wool-blend-trench-coat': 'outerwear',
  'polo-ralph-lauren-oxford-shirt': 'topsShirts',
  'ray-ban-aviator-classic-sunglasses': 'eyewearJewelry',
  'minimalist-leather-bifold-wallet': 'bagsLuggage',
  'daniel-wellington-classic-watch': 'watches',
  'pandora-sterling-silver-charm-bracelet': 'eyewearJewelry',
  'herschel-little-america-backpack': 'bagsLuggage',
  'apple-airpods-pro-2nd-gen': 'audio',
  'sony-wh-1000xm5-noise-canceling-headphones': 'audio',
  'keychron-k2-pro-mechanical-keyboard': 'monitorsDesk',
  'logitech-mx-master-3s-wireless-mouse': 'monitorsDesk',
  'anker-65w-gan-prime-fast-charger': 'chargingStorage',
  'nespresso-essenza-mini-espresso-machine': 'kitchenCoffee',
  'minimalist-nordic-desk-lamp': 'homeLiving',
  'marshall-emberton-ii-portable-speaker': 'audio',
  'dyson-pure-cool-tp04-air-purifier': 'homeLiving',
  'fellow-stagg-ekg-electric-pour-over-kettle': 'kitchenCoffee',
};

export function buildExtendedTemplates(): ProductTemplate[] {
  const laptopsTablets = buildGroup(
    'laptopsTablets',
    [
      'Apple MacBook Air 13 M3',
      'Apple MacBook Pro 14 M3',
      'Apple iPad Air 11 M2',
      'Apple iPad Pro 13 M4',
      'Samsung Galaxy Tab S9',
      'Dell XPS 13 OLED',
      'ASUS ROG Zephyrus G14',
      'Lenovo ThinkPad X1 Carbon',
      'Microsoft Surface Laptop 7',
      'Kindle Paperwhite Signature',
    ],
    4490000,
    2500000,
    [['Space Black', 'Silver'], ['Midnight', 'Starlight'], ['Graphite']],
    [['256GB', '512GB'], ['512GB', '1TB'], ['Standard']],
    'Engineered for portable performance and all-day battery life,'
  );

  const monitorsDesk = buildGroup(
    'monitorsDesk',
    [
      'LG UltraGear 27 4K Monitor',
      'Dell UltraSharp 27 USB-C Monitor',
      'Apple Studio Display 27 5K',
      'Keychron Q1 Pro Keyboard',
      'HHKB Professional Hybrid',
      'NuPhy Air75 V2 Keyboard',
      'Logitech G Pro X Superlight 2',
      'Razer DeathAdder V3 Pro',
      'Apple Magic Trackpad',
      'Elgato Stream Deck MK.2',
    ],
    2290000,
    1350000,
    [['Matte Black', 'Silver'], ['Graphite', 'White']],
    [['Standard'], ['27-inch']],
    'Built for ergonomic precision and clean studio desk setups,'
  );

  const audio = buildGroup(
    'audio',
    [
      'Apple AirPods Max USB-C',
      'Bose QuietComfort Ultra',
      'Sony WF-1000XM5 Earbuds',
      'Sennheiser Momentum 4',
      'Bowers & Wilkins Px7 S2e',
      'Bang & Olufsen Beoplay EX',
      'Bose SoundLink Max Speaker',
      'Sonos Era 100 Speaker',
      'Marshall Stanmore III',
      'JBL Charge 5 Wi-Fi',
      'Audio-Technica ATH-M50xBT2',
      'Shure MV7+ Podcast Mic',
    ],
    2890000,
    950000,
    [['Obsidian Black', 'Silver'], ['Sandstone', 'Navy'], ['Cream', 'Black']],
    [['Standard']],
    'Tuned for studio-grade acoustic clarity and immersive spatial sound,'
  );

  const chargingStorage = buildGroup(
    'chargingStorage',
    [
      'Anker Prime 250W Power Bank',
      'Belkin BoostCharge 3-in-1',
      'Ugreen Nexode 140W GaN Charger',
      'Samsung T9 2TB NVMe SSD',
      'SanDisk Extreme Pro 1TB SSD',
      'DJI Osmo Pocket 3',
      'GoPro HERO13 Black',
      'Insta360 X4 Action Camera',
    ],
    1190000,
    850000,
    [['Matte Black', 'Space Gray'], ['Silver', 'Black']],
    [['Standard'], ['1TB', '2TB']],
    'High-speed power delivery, rugged storage, and compact capture gear,'
  );

  const watches = buildGroup(
    'watches',
    [
      'Seiko Presage Cocktail Time',
      'Tissot PRX Powermatic 80',
      'Orient Bambino Version 7',
      'Casio G-Shock GM-2100',
      'Citizen Eco-Drive Corso',
      'Hamilton Khaki Field 38mm',
      'Longines Conquest Classic',
      'Omega x Swatch MoonSwatch',
      'Garmin Fenix 7S Pro Solar',
      'Apple Watch Series 10 Titanium',
    ],
    3200000,
    1850000,
    [['Silver', 'Blue Dial'], ['Black', 'Gold'], ['Brushed Steel', 'Green']],
    [['38mm', '40mm'], ['40mm', '42mm'], ['44mm']],
    'Precision horology pairing sapphire clarity with enduring craftsmanship,'
  );

  const bagsLuggage = buildGroup(
    'bagsLuggage',
    [
      'Bellroy Hide & Seek Wallet',
      'Montblanc Meisterstück Holder',
      'Coach Leather Crossbody Bag',
      'Polène Numéro Un Nano',
      'Peak Design Everyday Sling 6L',
      'Aer City Pack Pro Backpack',
      'Tumi Alpha Bravo Backpack',
      'Rimowa Essential Cabin',
    ],
    1650000,
    1100000,
    [['Black', 'Espresso'], ['Sand', 'Olive'], ['Slate']],
    [['One Size'], ['Standard']],
    'Crafted from full-grain leather, ballistic nylon, and lightweight polycarbonate,'
  );

  const eyewearJewelry = buildGroup(
    'eyewearJewelry',
    [
      'Garrett Leight Kinney Sunglasses',
      'Persol 714 Folding Sunglasses',
      'Gentle Monster Lang 01',
      'Swarovski Attract Pendant',
      'Mejuri Vermeil Hoop Earrings',
      'Anderson’s Woven Leather Belt',
      'Ray-Ban Clubmaster Classic',
    ],
    1450000,
    620000,
    [['Tortoise', 'Matte Black'], ['Gold', 'Silver'], ['Black']],
    [['One Size']],
    'Refined eyewear and fine everyday accents designed for effortless polish,'
  );

  const topsShirts = buildGroup(
    'topsShirts',
    [
      'COS Merino Wool Crewneck',
      'Uniqlo U Cotton Overshirt',
      'Arket Organic Poplin Shirt',
      'Ralph Lauren Oxford Shirt',
      'Lacoste Classic Piqué Polo',
      'Calvin Klein Modal Tee',
      'Theory Cashmere Turtleneck',
      'AMI Paris Ami de Coeur',
    ],
    690000,
    310000,
    [['Black', 'Ivory', 'Navy'], ['Sand', 'Olive', 'Slate']],
    [['S', 'M', 'L', 'XL']],
    'Breathable natural fibers cut for clean everyday layering,'
  );

  const outerwear = buildGroup(
    'outerwear',
    [
      'Massimo Dutti Wool Blazer',
      'Mango Linen Trench Coat',
      'AllSaints Balfern Leather Jacket',
      'Maje Tweed Cropped Cardigan',
      'Patagonia Better Sweater Vest',
      'The North Face 1996 Nuptse',
      'Carhartt WIP Detroit Jacket',
    ],
    1490000,
    620000,
    [['Black', 'Camel', 'Charcoal'], ['Navy', 'Olive']],
    [['S', 'M', 'L', 'XL']],
    'Structured outerwear engineered for warmth, weather resistance, and form,'
  );

  const bottomsDresses = buildGroup(
    'bottomsDresses',
    [
      'Zara Pleated Wide-Leg Trousers',
      'Tommy Hilfiger Chino Pants',
      'Sandro Ribbed Knit Midi Dress',
      'Nike Tech Fleece Joggers',
      'Vince Silk Satin Slip Skirt',
      'A.P.C. Petit New Standard Denim',
      'Cos Tailored Relaxed Shorts',
    ],
    890000,
    350000,
    [['Black', 'Stone', 'Indigo'], ['Ivory', 'Navy']],
    [['XS', 'S', 'M', 'L'], ['28', '30', '32', '34']],
    'Tailored silhouettes balancing fluid drape with all-day comfort,'
  );

  const skincare = buildGroup(
    'skincare',
    [
      'La Mer Moisturizing Cream',
      'SK-II Facial Treatment Essence',
      'Kiehl’s Ultra Facial Cream',
      'Estée Lauder Night Repair Serum',
      'Lancôme Génifique Concentrate',
      'Shiseido Ultimune Concentrate',
      'Sulwhasoo First Care Serum',
      'Aesop Resurrection Hand Balm',
      'Paula’s Choice 2% BHA Exfoliant',
      'Anessa Perfect UV Sunscreen',
      'Clinique Moisture Surge 100H',
    ],
    680000,
    410000,
    [['Original']],
    [['30ml', '50ml'], ['50ml', '100ml']],
    'Formulated with dermatologist-tested botanicals and barrier-supporting actives,'
  );

  const fragrance = buildGroup(
    'fragrance',
    [
      'Jo Malone English Pear Cologne',
      'Tom Ford Black Orchid EDP',
      'Byredo Gypsy Water EDP',
      'Dior Sauvage Eau de Toilette',
      'Chanel Coco Mademoiselle EDP',
      'Le Labo Santal 33 EDP',
      'Diptyque Philosykos EDP',
    ],
    2200000,
    520000,
    [['Clear']],
    [['50ml', '100ml']],
    'Signature Eau de Parfum and Cologne compositions crafted for lasting sillage,'
  );

  const makeupHair = buildGroup(
    'makeupHair',
    [
      'YSL Rouge Pur Couture Lipstick',
      'NARS Radiant Creamy Concealer',
      'Charlotte Tilbury Pillow Talk Blush',
      'MAC Studio Fix Foundation',
      'Laneige Lip Sleeping Mask',
      'Kérastase Elixir Ultime Oil',
      'Dyson Supersonic Prep Mist',
    ],
    480000,
    180000,
    [['Rose', 'Coral', 'Ruby'], ['Natural', 'Warm']],
    [['Standard'], ['100ml']],
    'Weightless pigments and nourishing hair care for a luminous finish,'
  );

  const kitchenCoffee = buildGroup(
    'kitchenCoffee',
    [
      'Breville Barista Express',
      'Hario V60 Ceramic Dripper',
      'Nespresso Vertuo Next',
      'Fellow Ode Brew Grinder Gen 2',
      'Chemex 6-Cup Pour-Over Carafe',
      'Le Creuset Cast Iron Dutch Oven',
      'Staub Cast Iron Cocotte 24cm',
      'Zwilling Pro 7-Piece Knife Block',
      'Balmuda The Toaster Steam',
      'Ember Smart Mug 2',
    ],
    790000,
    1050000,
    [['Matte Black', 'Brushed Steel'], ['Warm White', 'Sage'], ['Cherry Red', 'Slate']],
    [['Standard'], ['Compact', 'Large']],
    'Precision culinary and specialty coffee tools for the modern kitchen,'
  );

  const homeLiving = buildGroup(
    'homeLiving',
    [
      'Dyson V15 Detect Vacuum',
      'Roborock S8 Pro Ultra',
      'Philips Hue Signe Floor Lamp',
      'Nanoleaf Shapes Hexagons Kit',
      'Muji Ultrasonic Aroma Diffuser',
      'Aesop Botanical Room Spray',
      'Xiaomi Smart Air Purifier 4',
      'Coway Airmega AP-1512HH',
      'Simplehuman Sensor Trash Can',
      'Brooklinen Luxe Sateen Sheets',
    ],
    890000,
    920000,
    [['Matte White', 'Slate'], ['Warm Gray', 'Black'], ['Sand', 'Ivory']],
    [['Standard'], ['Queen', 'King']],
    'Designed to elevate daily living spaces with quiet, thoughtful utility,'
  );

  return [
    ...laptopsTablets,
    ...monitorsDesk,
    ...audio,
    ...chargingStorage,
    ...watches,
    ...bagsLuggage,
    ...eyewearJewelry,
    ...topsShirts,
    ...outerwear,
    ...bottomsDresses,
    ...skincare,
    ...fragrance,
    ...makeupHair,
    ...kitchenCoffee,
    ...homeLiving,
  ];
}

export function buildLargeSeedCatalog(cats: SeedCategoryMap) {
  return buildExtendedTemplates().map((item) => ({
    name: item.name,
    slug: item.slug,
    price: item.price,
    stock: item.stock,
    description: item.description,
    image: item.image,
    options: {
      colors: item.colors,
      sizes: item.sizes,
    },
    categoryId: cats[item.categoryKey]._id,
    isDeleted: false,
  }));
}
