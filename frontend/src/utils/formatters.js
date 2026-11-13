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
    'Fashion': 'Fashion',
    'Accessories': 'Watches',
    'Electronics': 'Smart Technology',
    'Home & Living': 'Home Living'
  };
  return map[name] || name;
}

/**
 * Category descriptions in English
 */
export function translateCategoryDesc(name = '', fallback = '') {
  const map = {
    'Cosmetics': 'Dermatological skincare, refined fragrances and authenticated cosmetics',
    'Fashion': 'Contemporary wardrobe staples and minimalist seasonal collections',
    'Accessories': 'Prestige timepieces, handcrafted jewelry and designer eyewear',
    'Electronics': 'High-fidelity audio, smart gadgets and high-performance computing',
    'Home & Living': 'Modern living essentials engineered for aesthetic comfort'
  };
  return map[name] || fallback || '';
}

/**
 * Editorial curated images for the 5 categories
 */
export function getCategoryEditorialImage(name = '') {
  const map = {
    'Cosmetics': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=900',
    'Fashion': 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=900',
    'Accessories': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=900',
    'Electronics': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=900',
    'Home & Living': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=900'
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
