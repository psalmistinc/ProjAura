const GHS_LOCALE = 'en-GH';
const GHS_CURRENCY = 'GHS';

export function formatGhs(amount: number): string {
  return new Intl.NumberFormat(GHS_LOCALE, {
    style: 'currency',
    currency: GHS_CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatGhsCompact(amount: number): string {
  if (amount >= 1_000_000) {
    return `¢${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `¢${(amount / 1_000).toFixed(1)}K`;
  }
  return formatGhs(amount);
}

export function parseGhs(formatted: string): number {
  return parseFloat(formatted.replace(/[^0-9.-]/g, ''));
}
