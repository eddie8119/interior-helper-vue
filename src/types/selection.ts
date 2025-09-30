export type ProjectType = 'residential' | 'luxury' | 'commercial' | 'office';

export interface ProjectTypeSelection {
  value: ProjectType;
  label: string;
}

export interface ConstructionSelection {
  name: string;
  id: number;
}
