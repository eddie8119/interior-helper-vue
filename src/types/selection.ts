export type ProjectType = 'residential' | 'luxury' | 'commercial' | 'office';

export interface ProjectTypeSelection {
  value: ProjectType;
  label: string;
}

export interface ConstructionSelection {
  name: string;
  id: string;
}

export interface SelectorOption<T = string> {
  value: T;
  label: string;
}
