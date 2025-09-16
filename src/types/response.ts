import type { ProjectType } from './selection';

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

export interface ProjectResponse {
  constructionContainer: string[];
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
  projectId: string;
  title: string;
  description: string;
  constructionType: string;
  status: string;
  dueDateTime: number | null;
  createdAt: Date;
  updatedAt: Date;
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
