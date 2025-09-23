// 材料
export interface Material {
  name: string;
  quantity: number | undefined;
  unitPrice: number | undefined;
}

// 任務數據
export interface TaskData {
  id?: string;
  title?: string;
  description?: string;
  status?: string;
  materials?: Material[];
  reminderDatetime?: number;
  createdAt?: number;
  updatedAt?: number;
}
