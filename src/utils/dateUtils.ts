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

export const formatDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const formatTime = (date: Date | undefined): string => {
  if (!date) return '--:--';
  const d = new Date(date);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export const isConsecutiveDate = (date1: Date, date2: Date): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  const timeDiff = d2.getTime() - d1.getTime();
  const dayDiff = timeDiff / (1000 * 60 * 60 * 24);
  return dayDiff === 1;
};

export const getWeekDay = (date: Date, t: (key: string) => string): string => {
  const weekDays = [
    t('date.sunday_short'),
    t('date.monday_short'),
    t('date.tuesday_short'),
    t('date.wednesday_short'),
    t('date.thursday_short'),
    t('date.friday_short'),
    t('date.saturday_short'),
  ];
  return weekDays[date.getDay()];
};

export const getMonthYear = (date: Date, t: (key: string) => string): string => {
  const monthNames = [
    t('date.january'),
    t('date.february'),
    t('date.march'),
    t('date.april'),
    t('date.may'),
    t('date.june'),
    t('date.july'),
    t('date.august'),
    t('date.september'),
    t('date.october'),
    t('date.november'),
    t('date.december'),
  ];
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
};
