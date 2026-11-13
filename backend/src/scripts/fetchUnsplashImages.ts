import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import type { CategoryKey } from '../config/seedProducts';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY?.trim();

const CATEGORY_QUERIES: Record<CategoryKey, string> = {
  laptopsTablets: 'macbook laptop tablet minimal',
  monitorsDesk: 'desk setup monitor mechanical keyboard',
  audio: 'headphones earbuds bluetooth speaker',
  chargingStorage: 'power bank camera charger gadget',
  watches: 'wristwatch luxury watch minimal',
  bagsLuggage: 'backpack leather bag luggage',
  eyewearJewelry: 'sunglasses jewelry necklace',
  topsShirts: 't-shirt sweater shirt fashion',
  outerwear: 'jacket trench coat blazer fashion',
  bottomsDresses: 'jeans trousers dress fashion',
  skincare: 'skincare serum bottle cream',
  fragrance: 'perfume bottle fragrance minimal',
  makeupHair: 'lipstick makeup cosmetics',
  kitchenCoffee: 'espresso coffee kettle cookware',
  homeLiving: 'modern lamp home decor vacuum',
};

const PAGES_PER_CATEGORY = 3; // 15 * 3 = 45 requests (fits Unsplash free Demo 50 req/hr limit)
const PER_PAGE = 30;

async function fetchPage(query: string, page: number): Promise<string[]> {
  const url = new URL('https://api.unsplash.com/search/photos');
  url.searchParams.set('query', query);
  url.searchParams.set('page', String(page));
  url.searchParams.set('per_page', String(PER_PAGE));
  url.searchParams.set('orientation', 'squarish');

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Client-ID ${ACCESS_KEY}`,
      'Accept-Version': 'v1',
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Unsplash API ${res.status}: ${body}`);
  }

  const data = (await res.json()) as { results?: Array<{ urls?: { regular?: string; small?: string } }> };
  return (data.results || [])
    .map((item) => item.urls?.regular || item.urls?.small)
    .filter((u): u is string => Boolean(u));
}

async function main() {
  if (!ACCESS_KEY) {
    console.error('❌ Missing UNSPLASH_ACCESS_KEY in backend/.env');
    console.error('   1. Create a free app at https://unsplash.com/developers');
    console.error('   2. Copy your Access Key and add UNSPLASH_ACCESS_KEY=your_key to backend/.env');
    console.error('   3. Re-run: npm run seed:images --workspace=backend');
    process.exit(1);
  }

  const outPath = path.resolve(process.cwd(), 'src/config/unsplashPools.json');
  const globalUsed = new Set<string>();
  const result: Partial<Record<CategoryKey, string[]>> = {};

  const entries = Object.entries(CATEGORY_QUERIES) as Array<[CategoryKey, string]>;
  let totalCollected = 0;

  for (const [key, query] of entries) {
    const catUrls: string[] = [];
    for (let page = 1; page <= PAGES_PER_CATEGORY; page++) {
      try {
        const urls = await fetchPage(query, page);
        for (const u of urls) {
          if (!globalUsed.has(u)) {
            globalUsed.add(u);
            catUrls.push(u);
          }
        }
        // Gentle delay to avoid burst rate limits
        await new Promise((r) => setTimeout(r, 150));
      } catch (err: any) {
        console.warn(`⚠️  Failed page ${page} for "${key}": ${err.message}`);
        break;
      }
    }
    result[key] = catUrls;
    totalCollected += catUrls.length;
    console.log(`✔ ${key}: collected ${catUrls.length} unique images`);
  }

  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8');
  console.log(`\n✅ Saved ${totalCollected} unique Unsplash image URLs to ${outPath}`);
  console.log('   Restart backend (npm run dev:backend) to apply them to MongoDB.');
}

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});

