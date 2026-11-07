/**
 * Format number to Vietnamese Dong currency format (VND)
 * @param {number} amount
 * @returns {string} e.g. "1.500.000 ₫"
 */
export function formatVND(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0 ₫';
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

/**
 * Format ISO date string to localized readable datetime
 * @param {string|Date} date
 * @returns {string} e.g. "07/11/2026 14:30"
 */
export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
}
