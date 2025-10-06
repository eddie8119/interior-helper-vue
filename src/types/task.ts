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
