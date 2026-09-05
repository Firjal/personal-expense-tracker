/**
 * Formats a numeric value into Indonesian Rupiah currency string.
 * Example: 1500000 -> "Rp1.500.000"
 */
export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rp0';
  }
  
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  // Replace standard non-breaking space or currency sign spacing if needed
  return formatted.replace(/\s+/g, '');
}

/**
 * Returns month names in Indonesian.
 */
export const BULAN_INDONESIA = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/**
 * Formats month (1-12) and year into "September 2026"
 */
export function formatBulanTahun(month: number, year: number): string {
  const monthName = BULAN_INDONESIA[month - 1] || BULAN_INDONESIA[0];
  return `${monthName} ${year}`;
}

/**
 * Formats YYYY-MM-DD into "05 Sep 2026" or "05/09/2026"
 */
export function formatTanggal(dateStr: string, formatStyle: 'short' | 'full' = 'short'): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr + 'T00:00:00');
  if (isNaN(date.getTime())) return dateStr;

  const day = String(date.getDate()).padStart(2, '0');
  const monthIndex = date.getMonth();
  const year = date.getFullYear();

  if (formatStyle === 'full') {
    return `${day} ${BULAN_INDONESIA[monthIndex]} ${year}`;
  }

  const monthShort = BULAN_INDONESIA[monthIndex].substring(0, 3);
  return `${day} ${monthShort} ${year}`;
}

/**
 * Gets start and end date strings for a given month and year in YYYY-MM-DD format.
 */
export function getMonthDateRange(month: number, year: number): { startDate: string; endDate: string } {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { startDate, endDate };
}

/**
 * Parses YYYY-MM-DD date string into month (1-12) and year numbers.
 */
export function parseMonthYear(dateStr: string): { month: number; year: number } {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
  }
  return { month: date.getMonth() + 1, year: date.getFullYear() };
}

/**
 * Preset palette for visual category charts
 */
export const CHART_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#64748b', // slate
];
