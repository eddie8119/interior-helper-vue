// 材料
export interface Material {
  name: string;
  quantity: number | null;
  unitPrice: number | null;
}

// 任務
export interface TaskData {
  title: string;
  description: string;
  materials: Material[];
  reminderDatetime: Date | null;
  type: string;
}
