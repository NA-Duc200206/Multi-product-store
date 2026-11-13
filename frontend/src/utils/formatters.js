/**
 * Format number to currency format (VND)
 * @param {number} amount
 * @returns {string} e.g. "1,500,000 ₫"
 */
export function formatVND(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0 ₫';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(amount).replace('VND', '₫');
}

/**
 * Format ISO date string to localized readable datetime
 * @param {string|Date} date
 * @returns {string} e.g. "Nov 8, 2026, 14:30"
 */
export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
}

/**
 * Standard category display names in English
 */
export function translateCategoryName(name = '') {
  const map = {
    'Cosmetics': 'Beauty',
    'Beauty': 'Beauty',
    'Fashion': 'Fashion',
    'Accessories': 'Watches',
    'Watches': 'Watches',
    'Bags, Eyewear': 'Bags, Eyewear',
    'Bags, Luggage': 'Bags, Luggage',
    'Eyewear, Jewelry': 'Eyewear, Jewelry',
    'Electronics': 'Smart Technology',
    'Computing': 'Computing',
    'Laptops, Tablets': 'Laptops, Tablets',
    'Monitors, Desk': 'Monitors, Desk',
    'Audio': 'Audio',
    'Tech Gear': 'Tech Gear',
    'Charging, Storage': 'Charging, Storage',
    'Tops, Shirts': 'Tops, Shirts',
    'Outerwear': 'Outerwear',
    'Bottoms, Dresses': 'Bottoms, Dresses',
    'Skincare': 'Skincare',
    'Fragrance': 'Fragrance',
    'Makeup, Hair': 'Makeup, Hair',
    'Kitchen, Coffee': 'Kitchen, Coffee',
    'Home & Living': 'Home Living',
    'Home Living': 'Home Living'
  };
  return map[name] || name;
}

/**
 * Category descriptions in English
 */
export function translateCategoryDesc(name = '', fallback = '') {
  const map = {
    'Cosmetics': 'Dermatological skincare, refined fragrances and authenticated cosmetics',
    'Skincare': 'Serums, moisturizers, cleansers and daily UV protection',
    'Fragrance': 'Signature Eau de Parfum and cologne compositions',
    'Makeup, Hair': 'Lip care, complexion essentials and nourishing hair oils',
    'Tops, Shirts': 'Tees, polo shirts, knitwear and tailored poplin shirts',
    'Outerwear': 'Trench coats, leather jackets, blazers and insulated vests',
    'Bottoms, Dresses': 'Selvedge denim, tailored trousers, joggers and dresses',
    'Watches': 'Mechanical, automatic and smart timepieces',
    'Bags, Luggage': 'Backpacks, slings, leather wallets and cabin luggage',
    'Eyewear, Jewelry': 'Designer sunglasses, fine jewelry and leather belts',
    'Laptops, Tablets': 'Ultrabooks, tablets and e-readers built for portable power',
    'Monitors, Desk': 'Studio displays, mechanical keyboards and precision mice',
    'Audio': 'Wireless headphones, earbuds, microphones and speakers',
    'Charging, Storage': 'GaN chargers, power banks, portable SSDs and action cameras',
    'Kitchen, Coffee': 'Specialty coffee gear, cast iron cookware and appliances',
    'Home & Living': 'Modern living essentials engineered for aesthetic comfort',
    'Home Living': 'Smart home vacuums, air purifiers, lighting and bedding'
  };
  return map[name] || fallback || '';
}

/**
 * Editorial curated images for categories
 */
export function getCategoryEditorialImage(name = '') {
  const map = {
    'Cosmetics': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=900',
    'Skincare': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=900',
    'Fragrance': 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=900',
    'Makeup, Hair': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=900',
    'Fashion': 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=900',
    'Tops, Shirts': 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=900',
    'Outerwear': 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=900',
    'Bottoms, Dresses': 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=900',
    'Accessories': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=900',
    'Watches': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=900',
    'Bags, Luggage': 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&q=80&w=900',
    'Eyewear, Jewelry': 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=900',
    'Electronics': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=900',
    'Laptops, Tablets': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=900',
    'Monitors, Desk': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=900',
    'Audio': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=900',
    'Charging, Storage': 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=900',
    'Kitchen, Coffee': 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=900',
    'Home & Living': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=900',
    'Home Living': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=900'
  };
  return map[name] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=900';
}

export const FALLBACK_IMAGE_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'%3E%3Crect width='600' height='600' fill='%23e2e8f0'/%3E%3Cpath d='M250 245h100v110H250z' fill='none' stroke='%2394a3b8' stroke-width='6' rx='10'/%3E%3Ccircle cx='280' cy='278' r='10' fill='%2394a3b8'/%3E%3Cpath d='M255 340l32-34 22 22 18-18 18 30z' fill='%2394a3b8'/%3E%3C/svg%3E";

export function getSafeImageUrl(url) {
  if (!url) return FALLBACK_IMAGE_URL;
  if (url.includes('photo-1590564313990-98a8d0d9a70e')) {
    return 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800';
  }
  return url;
}

export function handleImageError(e) {
  if (e?.currentTarget) {
    e.currentTarget.onerror = null;
    e.currentTarget.src = FALLBACK_IMAGE_URL;
  }
}
