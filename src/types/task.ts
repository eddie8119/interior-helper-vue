// 材料
export interface Material {
  name: string;
  quantity: number | undefined;
  unitPrice: number | undefined;
}

// 任務
export interface TaskData {
  id: string;
  title: string;
  description: string;
  reminderDatetime: Date | null;
  createdAt: string;
  projectId: string;
  userId: string;
  constructionType: string;
  updatedAt: string;
  status: string;
  materials: Material[];
}
