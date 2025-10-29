import type { Column } from '@/types/common';

export const PROJECT_COLUMNS: Column[] = [
  { field: 'index' },
  { field: 'title' },
  { field: 'type' },
  { field: 'task_done_progress', minWidth: 100 },
  { field: 'task_todo' },
  { field: 'task_in_progress' },
  { field: 'createdAt', align: 'center' },
];
