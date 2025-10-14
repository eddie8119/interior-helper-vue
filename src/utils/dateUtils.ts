/**
 * Calculate the number of days between now and a target date
 * @param targetDate - The target date to compare against
 * @returns Number of days until the target date (negative if in the past)
 */
export const getDaysUntil = (targetDate: string | Date | number | null): number | null => {
  if (!targetDate) return null;

  const now = new Date();
  const target = new Date(targetDate);

  // Reset time to start of day for accurate day calculation
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

/**
 * Check if a date falls within a days range
 * @param targetDate - The date to check
 * @param minDays - Minimum days (inclusive)
 * @param maxDays - Maximum days (inclusive, use 10 for ">10")
 * @returns true if the date falls within the range
 */
export const isWithinDaysRange = (
  targetDate: string | Date | number | null,
  minDays: number,
  maxDays: number
): boolean => {
  const daysUntil = getDaysUntil(targetDate);

  if (daysUntil === null) return false;

  // Handle ">10" case: maxDays = 10 means anything >= 10
  if (maxDays === 10 && daysUntil >= 10) return true;

  return daysUntil >= minDays && daysUntil <= maxDays;
};
