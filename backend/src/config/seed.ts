import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import {
  buildLargeSeedCatalog,
  buildExtendedTemplates,
  LEGACY_SLUG_CATEGORY_MAP,
  SeedCategoryMap,
  CategoryKey,
} from './seedProducts';

export const seedDatabase = async () => {
  try {
    // 1. Seed Users
    // Remove old seed users if present to ensure clean state
    await User.deleteMany({ email: { $in: ['admin@novacommerce.com', 'customer@novacommerce.com', 'admin@glowstore.com', 'customer@glowstore.com'] } });

    const adminExist = await User.findOne({ email: 'admin@glowstore.com' });
    const customerExist = await User.findOne({ email: 'customer@glowstore.com' });
    
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const customerPassword = await bcrypt.hash('customer123', salt);

    if (!adminExist) {
      await User.create({
        name: 'GlowStore Admin',
        email: 'admin@glowstore.com',
        password: adminPassword,
        role: 'admin',
        cart: [],
        wishlist: []
      });
    }
    if (!customerExist) {
      await User.create({
        name: 'John Doe',
        email: 'customer@glowstore.com',
        password: customerPassword,
        role: 'customer',
        cart: [],
        wishlist: []
      });
    }
    console.log('✔ Seeded users: admin@glowstore.com / customer@glowstore.com');

    // 2. Seed Categories & Products
    const categoryCount = await Category.countDocuments();
    const productCount = await Product.countDocuments();

    // If database is clean or contains only the old small dataset (less than 10 products), wipe and re-seed
    if (productCount < 10) {
      console.log('🔄 Wiping existing categories, products, and orders to seed rich dataset...');
      await Category.deleteMany({});
      await Product.deleteMany({});
      await Order.deleteMany({});
    }

    // 2. Seed / Upsert 15 Specific Categories
    const categoryDefinitions: Array<{ key: CategoryKey; name: string; slug: string; description: string }> = [
      { key: 'laptopsTablets', name: 'Laptops, Tablets', slug: 'laptops-tablets', description: 'Ultrabooks, tablets, and e-readers built for portable power.' },
      { key: 'monitorsDesk', name: 'Monitors, Desk', slug: 'monitors-desk', description: 'Studio displays, mechanical keyboards, and precision mice.' },
      { key: 'audio', name: 'Audio', slug: 'audio', description: 'Wireless headphones, earbuds, microphones, and speakers.' },
      { key: 'chargingStorage', name: 'Charging, Storage', slug: 'charging-storage', description: 'GaN chargers, power banks, portable SSDs, and action cameras.' },
      { key: 'watches', name: 'Watches', slug: 'watches', description: 'Mechanical, automatic, and smart timepieces.' },
      { key: 'bagsLuggage', name: 'Bags, Luggage', slug: 'bags-luggage', description: 'Backpacks, slings, leather wallets, and cabin luggage.' },
      { key: 'eyewearJewelry', name: 'Eyewear, Jewelry', slug: 'eyewear-jewelry', description: 'Designer sunglasses, fine jewelry, and leather belts.' },
      { key: 'topsShirts', name: 'Tops, Shirts', slug: 'tops-shirts', description: 'Tees, polo shirts, knitwear, and tailored poplin shirts.' },
      { key: 'outerwear', name: 'Outerwear', slug: 'outerwear', description: 'Trench coats, leather jackets, blazers, and insulated vests.' },
      { key: 'bottomsDresses', name: 'Bottoms, Dresses', slug: 'bottoms-dresses', description: 'Selvedge denim, tailored trousers, joggers, and dresses.' },
      { key: 'skincare', name: 'Skincare', slug: 'skincare', description: 'Serums, moisturizers, cleansers, and daily UV protection.' },
      { key: 'fragrance', name: 'Fragrance', slug: 'fragrance', description: 'Signature Eau de Parfum and cologne compositions.' },
      { key: 'makeupHair', name: 'Makeup, Hair', slug: 'makeup-hair', description: 'Lip care, complexion essentials, and nourishing hair oils.' },
      { key: 'kitchenCoffee', name: 'Kitchen, Coffee', slug: 'kitchen-coffee', description: 'Specialty coffee gear, cast iron cookware, and appliances.' },
      { key: 'homeLiving', name: 'Home Living', slug: 'home-living', description: 'Smart home vacuums, air purifiers, lighting, and bedding.' },
    ];

    const categoryMap = {} as SeedCategoryMap;
    for (const def of categoryDefinitions) {
      const doc = await Category.findOneAndUpdate(
        { slug: def.slug },
        { $set: { name: def.name, slug: def.slug, description: def.description } },
        { upsert: true, new: true }
      );
      categoryMap[def.key] = doc as any;
    }

    const beautyCat = categoryMap.skincare;
    const fashionCat = categoryMap.topsShirts;
    const accCat = categoryMap.watches;
    const electronicsCat = categoryMap.laptopsTablets;
    const homeCat = categoryMap.homeLiving;
    console.log('✔ Ensured 15 specific product categories');

    // 3. Seed Products
    const updatedProductCount = await Product.countDocuments();
    if (updatedProductCount === 0 && beautyCat && fashionCat && accCat && electronicsCat && homeCat) {
      await Product.insertMany([
        // --- Cosmetics ---
        {
          name: 'Dior Addict Lip Glow Lip Balm',
          slug: 'dior-addict-lip-glow-lip-balm',
          price: 950000.00,
          stock: 45,
          description: 'Dior Addict Lip Glow is the all-time best-selling lip balm. Infused with cherry oil, it delivers instant 24-hour hydration and enhances natural lip color.',
          image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800',
          options: {
            colors: ['Pink', 'Coral', 'Rosewood'],
            sizes: ['3.2g']
          },
          categoryId: beautyCat._id,
          isDeleted: false
        },
        {
          name: 'Chanel Bleu de Chanel EDP Perfume',
          slug: 'chanel-bleu-de-chanel-edp-perfume',
          price: 3400000.00,
          stock: 15,
          description: 'Bleu de Chanel Eau de Parfum features a fresh, clean, and profoundly sensual woody aromatic fragrance for men. The scent opens with fresh grapefruit and mint, followed by elegant geranium and ends with warm cedarwood.',
          image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800',
          options: {
            colors: [],
            sizes: ['50ml', '100ml']
          },
          categoryId: beautyCat._id,
          isDeleted: false
        },
        {
          name: 'La Roche-Posay Anthelios UVmune Sunscreen',
          slug: 'la-roche-posay-anthelios-uvmune-sunscreen',
          price: 450000.00,
          stock: 60,
          description: 'La Roche-Posay Anthelios UVmune 400 SPF50+ oil control sunscreen provides optimal protection against dangerous ultra-long UVA rays. Fast-absorbing, no white cast, perfect for sensitive oily skin.',
          image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800',
          options: {
            colors: [],
            sizes: ['50ml']
          },
          categoryId: beautyCat._id,
          isDeleted: false
        },
        {
          name: 'Estee Lauder Night Repair Serum',
          slug: 'estee-lauder-night-repair-serum',
          price: 3100000.00,
          stock: 22,
          description: 'Patented serum reduces the look of multiple signs of aging caused by environmental assaults. Skin feels smoother, less lined, more youthful, and radiant.',
          image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=800',
          options: {
            colors: [],
            sizes: ['30ml', '50ml']
          },
          categoryId: beautyCat._id,
          isDeleted: false
        },
        {
          name: 'MAC Matte Lipstick - Ruby Woo',
          slug: 'mac-matte-lipstick-ruby-woo',
          price: 650000.00,
          stock: 50,
          description: 'A long-wearing lipstick formula with intense color payoff and a completely matte finish. Iconic, universally flattering vivid blue-red shade Ruby Woo.',
          image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800',
          options: {
            colors: ['Ruby Woo'],
            sizes: ['3g']
          },
          categoryId: beautyCat._id,
          isDeleted: false
        },
        {
          name: 'Laneige Water Sleeping Mask',
          slug: 'laneige-water-sleeping-mask',
          price: 750000.00,
          stock: 35,
          description: 'Overnight mask featuring Sleeping Micro Biome and enhanced Pro-biotics Complex that strengthens the skin’s defense, revealing a bright and clear complexion.',
          image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800',
          options: {
            colors: [],
            sizes: ['70ml']
          },
          categoryId: beautyCat._id,
          isDeleted: false
        },

        // --- Fashion ---
        {
          name: 'Lacoste Classic Fit Polo Shirt',
          slug: 'lacoste-classic-fit-polo-shirt',
          price: 2100000.00,
          stock: 25,
          description: 'The iconic Lacoste polo shirt in breathable cotton petit piqué with the signature green crocodile logo on the chest. Classic fit, comfortable and elegant for men.',
          image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=800',
          options: {
            colors: ['Black', 'Navy', 'White', 'Green'],
            sizes: ['S', 'M', 'L', 'XL']
          },
          categoryId: fashionCat._id,
          isDeleted: false
        },
        {
          name: 'Elegant Evening Satin Silk Dress',
          slug: 'elegant-evening-satin-silk-dress',
          price: 1850000.00,
          stock: 12,
          description: 'Soft and elegant satin silk evening gown that brings a sophisticated allure to ladies for parties and events. Meticulously tailored using premium lightweight satin silk.',
          image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800',
          options: {
            colors: ['Emerald', 'Ruby', 'Midnight Blue'],
            sizes: ['S', 'M', 'L']
          },
          categoryId: fashionCat._id,
          isDeleted: false
        },
        {
          name: "Levi's 501 Original Fit Jeans",
          slug: 'levis-501-original-fit-jeans',
          price: 1950000.00,
          stock: 30,
          description: 'The original blue jean since 1873. The 501 Original Fit Jeans are straight through the hip with a signature button fly, crafted from 100% premium cotton denim.',
          image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=800',
          options: {
            colors: ['Dark Indigo', 'Light Wash', 'Black'],
            sizes: ['30', '31', '32', '34']
          },
          categoryId: fashionCat._id,
          isDeleted: false
        },
        {
          name: 'Nike Sportswear Club Fleece Hoodie',
          slug: 'nike-sportswear-club-fleece-hoodie',
          price: 1250000.00,
          stock: 40,
          description: 'A closet staple, the Nike Sportswear Club Fleece Pullover Hoodie combines classic style with the soft comfort of fleece. Brushed-back fleece fabric feels soft and smooth.',
          image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800',
          options: {
            colors: ['Grey', 'Black', 'Olive'],
            sizes: ['S', 'M', 'L', 'XL']
          },
          categoryId: fashionCat._id,
          isDeleted: false
        },
        {
          name: 'Zara Tweed Crop Blazer',
          slug: 'zara-tweed-crop-blazer',
          price: 1600000.00,
          stock: 15,
          description: 'Chic cropped jacket with a round neck, long sleeves, front patch pockets, and textured tweed fabric. Fully lined with matching jewel button closure.',
          image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800',
          options: {
            colors: ['Cream', 'Black/White'],
            sizes: ['XS', 'S', 'M', 'L']
          },
          categoryId: fashionCat._id,
          isDeleted: false
        },
        {
          name: 'Uniqlo Ultra Light Down Jacket',
          slug: 'uniqlo-ultra-light-down-jacket',
          price: 1790000.00,
          stock: 20,
          description: 'Thin, light, and warm down jacket. Designed with a durable water-repellent coating and highly compact pocketable design for easy transport in its storage bag.',
          image: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&q=80&w=800',
          options: {
            colors: ['Navy', 'Black', 'Wine Red'],
            sizes: ['M', 'L', 'XL']
          },
          categoryId: fashionCat._id,
          isDeleted: false
        },

        // --- Accessories ---
        {
          name: 'Ray-Ban Classic Clubmaster Sunglasses',
          slug: 'ray-ban-classic-clubmaster-sunglasses',
          price: 3800000.00,
          stock: 8,
          description: 'Ray-Ban Clubmaster Classic sunglasses are retro and timeless. Inspired by the 50s, the unmistakable design of the Clubmaster Classic is worn by intellectuals who lead the change tomorrow.',
          image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800',
          options: {
            colors: ['Black Gold', 'Tortoise'],
            sizes: ['Standard']
          },
          categoryId: accCat._id,
          isDeleted: false
        },
        {
          name: "Coach Slim Billfold Leather Wallet",
          slug: 'coach-slim-billfold-leather-wallet',
          price: 2200000.00,
          stock: 30,
          description: "Coach men's wallet crafted from durable natural pebble leather, highly resistant to scratches. Ultra-slim design with ample slots for cash, cards, and receipts.",
          image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800',
          options: {
            colors: ['Black', 'Brown'],
            sizes: ['Standard']
          },
          categoryId: accCat._id,
          isDeleted: false
        },
        {
          name: 'Daniel Wellington Sheffield Watch',
          slug: 'daniel-wellington-sheffield-watch',
          price: 4200000.00,
          stock: 12,
          description: 'With its dark black leather strap and an elegant eggshell-white dial, this minimalistic watch is a timeless classic suitable for both formal and casual occasions.',
          image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
          options: {
            colors: ['Rose Gold', 'Silver'],
            sizes: ['36mm', '40mm']
          },
          categoryId: accCat._id,
          isDeleted: false
        },
        {
          name: 'Swarovski Iconic Swan Necklace',
          slug: 'swarovski-iconic-swan-necklace',
          price: 2800000.00,
          stock: 18,
          description: "This elegant rose-gold plated pendant features Swarovski's legendary swan motif, beautifully embellished with sparkling black crystal pavé.",
          image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800',
          options: {
            colors: ['Black/Rose Gold', 'Blue/Silver'],
            sizes: ['Standard']
          },
          categoryId: accCat._id,
          isDeleted: false
        },
        {
          name: 'Fjallraven Kanken Classic Backpack',
          slug: 'fjallraven-kanken-classic-backpack',
          price: 2100000.00,
          stock: 25,
          description: 'Classic Kånken backpack in hard-wearing Vinylon fabric with a zip that opens the entire main compartment. Removable seat cushion, small front pocket, and simple shoulder straps.',
          image: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&q=80&w=800',
          options: {
            colors: ['Ocean Green', 'Ox Red', 'Graphite'],
            sizes: ['16L']
          },
          categoryId: accCat._id,
          isDeleted: false
        },

        // --- Electronics ---
        {
          name: 'Apple AirPods Pro (2nd Gen)',
          slug: 'apple-airpods-pro-2nd-gen',
          price: 5990000.00,
          stock: 15,
          description: 'AirPods Pro feature up to 2x more Active Noise Cancellation, plus Adaptive Audio, Transparency mode, and Personalized Spatial Audio for an immersive sound experience.',
          image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&q=80&w=800',
          options: {
            colors: ['White'],
            sizes: ['MagSafe USB-C']
          },
          categoryId: electronicsCat._id,
          isDeleted: false
        },
        {
          name: 'Sony WH-1000XM5 ANC Headphones',
          slug: 'sony-wh-1000xm5-anc-headphones',
          price: 8490000.00,
          stock: 10,
          description: 'Industry-leading noise canceling wireless over-ear headphones with premium sound, crystal-clear hands-free calling, and smart Auto-NC Optimizer.',
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
          options: {
            colors: ['Black', 'Platinum Silver'],
            sizes: ['Standard']
          },
          categoryId: electronicsCat._id,
          isDeleted: false
        },
        {
          name: 'Keychron K2 Wireless Keyboard',
          slug: 'keychron-k2-wireless-keyboard',
          price: 1890000.00,
          stock: 22,
          description: 'A 75% layout wireless mechanical keyboard with Gateron switches, RGB backlighting, and a hot-swappable aluminum frame option. Connects up to 3 devices.',
          image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=800',
          options: {
            colors: ['Red Switch', 'Blue Switch', 'Brown Switch'],
            sizes: ['Plastic', 'Aluminum']
          },
          categoryId: electronicsCat._id,
          isDeleted: false
        },
        {
          name: 'Logitech MX Master 3S Mouse',
          slug: 'logitech-mx-master-3s-mouse',
          price: 2490000.00,
          stock: 35,
          description: 'An iconic mouse remastered. Feel every moment of your workflow with even more precision, quiet clicks, and 8,000 DPI track-on-glass sensor.',
          image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=800',
          options: {
            colors: ['Graphite', 'Pale Grey'],
            sizes: ['Standard']
          },
          categoryId: electronicsCat._id,
          isDeleted: false
        },
        {
          name: 'Anker PowerCore 24K Power Bank',
          slug: 'anker-powercore-24k-power-bank',
          price: 1990000.00,
          stock: 25,
          description: 'Ultra-high capacity power bank with 140W two-way charging and a smart digital display for real-time monitoring of input, output, and recharge time.',
          image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=800',
          options: {
            colors: ['Black'],
            sizes: ['24000mAh']
          },
          categoryId: electronicsCat._id,
          isDeleted: false
        },

        // --- Home & Living ---
        {
          name: 'Nespresso Pixie Espresso Maker',
          slug: 'nespresso-pixie-espresso-maker',
          price: 4990000.00,
          stock: 14,
          description: 'Compact, fast, and energy-efficient espresso machine that brews barista-grade espresso cups in seconds with 19 bar high-pressure extraction.',
          image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=800',
          options: {
            colors: ['Titan', 'Red'],
            sizes: ['Standard']
          },
          categoryId: homeCat._id,
          isDeleted: false
        },
        {
          name: 'Philips Hue White & Color Kit',
          slug: 'philips-hue-white-color-kit',
          price: 3290000.00,
          stock: 16,
          description: 'Smart lighting starter kit with 3 E27 color-changing LED bulbs and Hue Bridge. Sync your lights with movies, music, and games for immersive effects.',
          image: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&q=80&w=800',
          options: {
            colors: ['RGB Color'],
            sizes: ['E27 Bulbs x3']
          },
          categoryId: homeCat._id,
          isDeleted: false
        },
        {
          name: 'Marshall Emberton II Speaker',
          slug: 'marshall-emberton-ii-speaker',
          price: 3950000.00,
          stock: 18,
          description: 'A compact portable speaker with the loud and vibrant sound only Marshall can deliver, featuring 30+ hours of playtime and IP67 dust and water resistance.',
          image: 'https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&q=80&w=800',
          options: {
            colors: ['Black and Brass', 'Cream'],
            sizes: ['Standard']
          },
          categoryId: homeCat._id,
          isDeleted: false
        },
        {
          name: 'Xiaomi Smart Humidifier 2',
          slug: 'xiaomi-smart-humidifier-2',
          price: 1190000.00,
          stock: 30,
          description: 'UV-C instant sterilization and purification system that releases clean, fine mist to soothe dry air for a healthier home. App-controlled scheduling.',
          image: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&q=80&w=800',
          options: {
            colors: ['White'],
            sizes: ['4.5L']
          },
          categoryId: homeCat._id,
          isDeleted: false
        },
        {
          name: 'Fellow Stagg EKG Electric Kettle',
          slug: 'fellow-stagg-ekg-electric-kettle',
          price: 4500000.00,
          stock: 12,
          description: 'The go-to electric pour-over kettle for coffee lovers. Variable temperature control, LCD display, and stunning minimalist design in matte black.',
          image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800',
          options: {
            colors: ['Matte Black', 'Polished Steel'],
            sizes: ['0.9L']
          },
          categoryId: homeCat._id,
          isDeleted: false
        }
      ]);
      console.log('✔ Seeded products');
    }

    // 3b. Upsert extended catalog & migrate existing products to the 9 specific categories
    const extendedTemplates = buildExtendedTemplates();
    const slugToCategoryId = new Map<string, any>();

    Object.entries(LEGACY_SLUG_CATEGORY_MAP).forEach(([slug, key]) => {
      if (categoryMap[key]) slugToCategoryId.set(slug, categoryMap[key]._id);
    });
    extendedTemplates.forEach((tpl) => {
      if (categoryMap[tpl.categoryKey]) slugToCategoryId.set(tpl.slug, categoryMap[tpl.categoryKey]._id);
    });

    const bulkOps: any[] = [];
    Object.entries(LEGACY_SLUG_CATEGORY_MAP).forEach(([slug, key]) => {
      const catId = categoryMap[key]?._id;
      if (catId) {
        bulkOps.push({
          updateOne: {
            filter: { slug, categoryId: { $ne: catId } },
            update: { $set: { categoryId: catId } },
          },
        });
      }
    });
    extendedTemplates.forEach((tpl) => {
      const catId = categoryMap[tpl.categoryKey]?._id;
      if (catId) {
        bulkOps.push({
          updateOne: {
            filter: { slug: tpl.slug, $or: [{ categoryId: { $ne: catId } }, { image: { $ne: tpl.image } }] },
            update: { $set: { categoryId: catId, image: tpl.image } },
          },
        });
      }
    });
    if (bulkOps.length > 0) {
      const bulkRes = await Product.bulkWrite(bulkOps);
      if (bulkRes.modifiedCount > 0) {
        console.log(`✔ Updated ${bulkRes.modifiedCount} products (category/image sync)`);
      }
    }

    const existingProducts = await Product.find({}, 'slug').lean();
    const existingSlugs = new Set(existingProducts.map((p: any) => p.slug));
    const extendedCatalog = buildLargeSeedCatalog(categoryMap);
    const missingProducts = extendedCatalog.filter((item) => !existingSlugs.has(item.slug));
    if (missingProducts.length > 0) {
      await Product.insertMany(missingProducts);
      console.log(`✔ Seeded ${missingProducts.length} additional products into catalog`);
    }

    // Remove legacy broad categories if no products remain on them
    const legacySlugs = [
      'cosmetics',
      'accessories',
      'electronics',
      'computing',
      'tech-gear',
      'bags-eyewear',
      'fashion',
      'beauty',
    ];
    for (const oldSlug of legacySlugs) {
      const oldCat = await Category.findOne({ slug: oldSlug });
      if (oldCat) {
        const count = await Product.countDocuments({ categoryId: oldCat._id as any });
        if (count === 0) {
          await Category.deleteOne({ _id: oldCat._id });
        }
      }
    }

    // 4. Seed Orders (Historical Transactions)
    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      const customers = await User.find({ role: 'customer' });
      const productsList = await Product.find({ isDeleted: false });

      if (customers.length > 0 && productsList.length > 0) {
        const ordersToInsert = [];

        // Generate 60 historical orders spread over the last 6 months (180 days)
        for (let i = 0; i < 60; i++) {
          // Date distribution: spread over 180 days
          const daysAgo = Math.floor(Math.pow(Math.random(), 1.3) * 180);
          const orderDate = new Date();
          orderDate.setDate(orderDate.getDate() - daysAgo);
          orderDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

          // Pick 1 to 3 random products
          const numItems = Math.floor(Math.random() * 3) + 1;
          const items = [];
          let totalAmount = 0;

          const shuffledProducts = [...productsList].sort(() => 0.5 - Math.random());
          for (let j = 0; j < Math.min(numItems, shuffledProducts.length); j++) {
            const prod = shuffledProducts[j];
            const qty = Math.floor(Math.random() * 2) + 1;
            const price = prod.price;
            const color = prod.options?.colors?.length ? prod.options.colors[Math.floor(Math.random() * prod.options.colors.length)] : undefined;
            const size = prod.options?.sizes?.length ? prod.options.sizes[Math.floor(Math.random() * prod.options.sizes.length)] : undefined;

            items.push({
              productId: prod._id,
              name: prod.name,
              price: price,
              quantity: qty,
              color,
              size
            });
            totalAmount += price * qty;
          }

          // Determine status & payment details
          const rand = Math.random();
          let status: any = 'completed';
          let paymentStatus: 'pending' | 'paid' | 'failed' = 'paid';
          let paymentMethod: 'cod' | 'vnpay' = Math.random() > 0.4 ? 'vnpay' : 'cod';

          if (rand < 0.7) {
            status = 'completed';
            paymentStatus = 'paid';
          } else if (rand < 0.85) {
            status = 'delivered';
            paymentStatus = 'paid';
          } else if (rand < 0.95) {
            status = 'cancelled';
            paymentStatus = rand > 0.9 ? 'failed' : 'pending';
            paymentMethod = 'vnpay';
          } else {
            status = 'pending';
            paymentStatus = 'pending';
          }

          // Build status history
          const statusHistory = [
            { status: 'pending', timestamp: orderDate, note: 'Order placed successfully' }
          ];

          if (status !== 'pending' && status !== 'cancelled') {
            const confTime = new Date(orderDate);
            confTime.setHours(confTime.getHours() + 2);
            statusHistory.push({ status: 'confirmed', timestamp: confTime, note: 'Order confirmed by store' });

            const packTime = new Date(orderDate);
            packTime.setDate(packTime.getDate() + 1);
            statusHistory.push({ status: 'packaging', timestamp: packTime, note: 'Product is being packed' });

            const shipTime = new Date(orderDate);
            shipTime.setDate(shipTime.getDate() + 1);
            shipTime.setHours(shipTime.getHours() + 12);
            statusHistory.push({ status: 'shipping', timestamp: shipTime, note: 'Shipped via GlowExpress' });

            if (status === 'delivered' || status === 'completed') {
              const delivTime = new Date(orderDate);
              delivTime.setDate(delivTime.getDate() + 3);
              statusHistory.push({ status: 'delivered', timestamp: delivTime, note: 'Delivered to customer' });
            }

            if (status === 'completed') {
              const compTime = new Date(orderDate);
              compTime.setDate(compTime.getDate() + 4);
              statusHistory.push({ status: 'completed', timestamp: compTime, note: 'Order marked as completed' });
            }
          } else if (status === 'cancelled') {
            const cancelTime = new Date(orderDate);
            cancelTime.setHours(cancelTime.getHours() + 1);
            statusHistory.push({ status: 'cancelled', timestamp: cancelTime, note: 'Order cancelled' });
          }

          const customer = customers[Math.floor(Math.random() * customers.length)];

          ordersToInsert.push({
            userId: customer._id,
            shippingAddress: '123 Premium Slate Blvd, District 1, Ho Chi Minh City',
            billingAddress: '123 Premium Slate Blvd, District 1, Ho Chi Minh City',
            paymentMethod,
            paymentStatus,
            status,
            items,
            totalAmount,
            statusHistory,
            vnpayTxnRef: paymentMethod === 'vnpay' ? `VNPAY${Math.floor(Math.random() * 10000000)}` : undefined,
            createdAt: orderDate,
            updatedAt: orderDate
          });
        }

        // Direct driver write to bypass Mongoose's auto-update-timestamp behavior
        await Order.collection.insertMany(ordersToInsert);
        console.log(`✔ Seeded ${ordersToInsert.length} historical orders spread across the last 6 months`);
      }
    }
  } catch (err: any) {
    console.error('❌ Database seeding error:', err.message);
  }
};
