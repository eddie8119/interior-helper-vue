import { formatDateKey, getMonthYear, getWeekDay } from './dateUtils';

import type { TaskResponse } from '@/types/response';

export interface DayGroup {
  dateKey: string;
  date: Date;
  day: number;
  weekDay: string;
  monthYear: string;
  tasks: TaskResponse[];
}

export const groupTasksByDate = (tasks: TaskResponse[], t: (key: string) => string): DayGroup[] => {
  if (tasks.length === 0) return [];

  // Get unique dates from tasks
  const uniqueDates = new Map<string, Date>();
  tasks.forEach((task) => {
    const taskDate = task.reminderDateTime || task.endDateTime;
    if (taskDate) {
      const date = new Date(taskDate);
      const dateKey = formatDateKey(date);
      if (!uniqueDates.has(dateKey)) {
        uniqueDates.set(dateKey, date);
      }
    }
  });

  // Sort dates
  const sortedDates = Array.from(uniqueDates.values()).sort((a, b) => a.getTime() - b.getTime());

  // Group tasks by date
  const groups: DayGroup[] = sortedDates.map((date) => {
    const dateKey = formatDateKey(date);
    const tasksForDay = tasks.filter((task) => {
      const taskDate = task.reminderDateTime || task.endDateTime;
      if (!taskDate) return false;
      return formatDateKey(new Date(taskDate)) === dateKey;
    });

    // Sort tasks by time
    tasksForDay.sort((a, b) => {
      const timeA = a.reminderDateTime || a.endDateTime;
      const timeB = b.reminderDateTime || b.endDateTime;
      if (!timeA || !timeB) return 0;
      return new Date(timeA).getTime() - new Date(timeB).getTime();
    });

    return {
      dateKey,
      date,
      day: date.getDate(),
      weekDay: getWeekDay(date, t),
      monthYear: getMonthYear(date, t),
      tasks: tasksForDay,
    };
  });

  return groups;
};
