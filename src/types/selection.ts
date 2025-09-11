export type ProjectType = 'residential' | 'luxury' | 'commercial' | 'office';

export interface ProjectTypeSelection {
  value: ProjectType;
  label: string;
}

export interface ConstructionSelection {
  type: string;
  order: number;
}
