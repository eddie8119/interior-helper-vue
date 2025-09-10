export type ProjectType = 'residential' | 'luxury' | 'commercial' | 'office';

export interface ProjectTypeSelection {
  value: ProjectType;
  label: string;
}

export interface ConstructionSelection {
  id: string;
  type: string;
  order: number;
}
