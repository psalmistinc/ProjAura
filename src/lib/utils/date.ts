import { addBusinessDays, differenceInBusinessDays, isWeekend, format } from 'date-fns';

export function calculateSLADeadline(startDate: Date, businessDays: number): Date {
  return addBusinessDays(startDate, businessDays);
}

export function getRemainingBusinessDays(deadline: Date): number {
  const now = new Date();
  if (deadline <= now) return 0;
  return differenceInBusinessDays(deadline, now);
}

export function formatSLARemaining(deadline: Date): string {
  const now = new Date();
  if (deadline <= now) return 'Breached';

  const diffMs = deadline.getTime() - now.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function getSLAStatus(
  deadline: Date,
  elapsedPercentage: number
): 'ON_TRACK' | 'AT_RISK' | 'BREACHED' {
  if (deadline <= new Date()) return 'BREACHED';
  if (elapsedPercentage >= 0.7) return 'AT_RISK';
  return 'ON_TRACK';
}

export function formatApiDate(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
}
