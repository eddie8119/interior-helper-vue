import type { ConstructionSelection, ProjectType } from './selection';
import type { TaskStatus } from '@/types/task';
import type { CreateTaskSchema } from '@/utils/schemas/createTaskSchema';

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
  };
  access_token: string;
  refresh_token: string;
}

export interface CommonResponse {
  id: string;
  construction: ConstructionSelection[];
  unit: string[];
  projectType: string[];
}

export interface DraftResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  tasks: {
    id: string;
    content: string;
    completed: boolean;
  }[];
}

export interface ProjectResponse {
  constructionContainer: ConstructionSelection[] | null;
  id: string;
  title: string;
  type: ProjectType;
  userId: string;
  isShared: boolean;
  tasks?: TaskResponse[];
  createdAt: Date;
  updatedAt: Date;
}

// 任務
export interface TaskResponse extends CreateTaskSchema {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  lastReminderSentAt: Date | null;
  lineReminderSent: boolean;
  emailReminderSent: boolean;
  status: TaskStatus;
}

// 任務材料
export interface TaskMaterialResponse {
  id: string;
  taskId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  createdAt: Date;
  updatedAt: Date;
}
