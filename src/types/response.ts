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

// 協作者角色
export type CollaboratorRole = 'viewer' | 'editor' | 'manager';

// 專案協作者
export interface ProjectCollaboratorResponse {
  id: string;
  projectId: string;
  userId: string;
  collaboratorEmail: string;
  role: CollaboratorRole;
  isGlobal: boolean; // 是否為全域協作者
  globalRole: CollaboratorRole | null; // 全域角色（如果是全域協作者）
  createdAt: Date;
  updatedAt: Date;
}

// 全域協作者
export interface GlobalCollaboratorResponse {
  id: string;
  ownerId: string;
  collaboratorEmail: string;
  role: CollaboratorRole;
  createdAt: Date;
  updatedAt: Date;
}
