import { differenceInDays } from 'date-fns';

/**
 * Checks if a given date is within a specified range of days from today.
 * @param date - The date string to check (ISO 8601 format).
 * @param minDays - The minimum number of days from today (inclusive).
 * @param maxDays - The maximum number of days from today (inclusive).
 * @returns True if the date is within the range, false otherwise.
 */
export function isWithinDays(
  date: Date | null | undefined,
  minDays: number,
  maxDays: number
): boolean {
  if (!date) return false;

  try {
    const targetDate = date; // It's already a Date object
    const today = new Date();
    const diff = differenceInDays(targetDate, today);

    if (maxDays >= 10) {
      return diff >= minDays;
    }

    return diff >= minDays && diff <= maxDays;
  } catch (error) {
    console.error('Error calculating date difference:', date, error);
    return false;
  }
}
