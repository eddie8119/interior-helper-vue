import type { Column } from '@/types/common';

export const PROJECT_COLUMNS: Column[] = [
  { field: 'index' },
  { field: 'title' },
  { field: 'type' },
  { field: 'task_progress', minWidth: 100 },
  { field: 'createdAt', align: 'center' },
];
