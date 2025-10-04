import type { ConstructionSelection, ProjectType } from './selection';

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
  createdAt: Date;
  updatedAt: Date;
}

// 任務
export interface TaskResponse {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  projectId: string;
  constructionType: string;
  createdAt: Date;
  updatedAt: Date;
  reminderDatetime: Date | null;
  lastReminderSentAt: Date | null;
  lineReminderSent: boolean;
  emailReminderSent: boolean;
  materials: TaskMaterialResponse[];
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
