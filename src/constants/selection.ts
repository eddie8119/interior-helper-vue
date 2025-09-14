import type { ConstructionSelection, ProjectTypeSelection } from '@/types/selection';

export const PROJECT_TYPES: ProjectTypeSelection[] = [
  { value: 'residential', label: 'residential' },
  { value: 'luxury', label: 'luxury' },
  { value: 'commercial', label: 'commercial' },
  { value: 'office', label: 'office' },
];

export const CONSTRUCTION_CONTAINER: ConstructionSelection[] = [
  {
    type: '拆除',
    order: 0,
  },
  {
    type: '機電',
    order: 1,
  },
  {
    type: '水電',
    order: 2,
  },
  {
    type: '地坪',
    order: 3,
  },
  {
    type: '泥作',
    order: 4,
  },
  {
    type: '門框',
    order: 5,
  },
  {
    type: '輕隔間',
    order: 6,
  },
  {
    type: '木作',
    order: 7,
  },
  {
    type: '金屬',
    order: 8,
  },
  {
    type: '玻璃',
    order: 9,
  },
  {
    type: '油漆',
    order: 10,
  },
  {
    type: '地板',
    order: 11,
  },
  {
    type: '防水',
    order: 12,
  },
  {
    type: '衛浴設備',
    order: 13,
  },
  {
    type: '廚具',
    order: 14,
  },
  {
    type: '空調',
    order: 15,
  },
  {
    type: '結構補強',
    order: 16,
  },
];
