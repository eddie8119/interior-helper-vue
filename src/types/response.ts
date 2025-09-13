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
}
