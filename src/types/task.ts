// 材料
export interface Material {
  name: string;
  quantity?: number;
  unitPrice?: number;
}

export enum TaskStatusEnum {
  TODO = 'todo',
  IN_PROGRESS = 'inProgress',
  DONE = 'done',
}

export type TaskStatus = 'todo' | 'inProgress' | 'done';

export enum TaskTimeReminderStatus {
  OVERDUE = 'overdue',
  REMINDING = 'reminding',
  NONE = 'none',
}

export enum TaskTimeCondition {
  ALL = 'all',
  UNSCHEDULED = 'unscheduled',
  OVERDUE = 'overdue',
  TODAY = 'today',
  THIS_WEEK = 'this_week',
  THIS_MONTH = 'this_month',
}
