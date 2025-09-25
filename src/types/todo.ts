export type TodoFilterType = 'all' | 'done' | 'todo';

export interface TodoItem {
  id: string;
  content: string;
  completed: boolean;
}
