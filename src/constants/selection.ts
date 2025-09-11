import type { ConstructionSelection, ProjectTypeSelection } from '@/types/selection';

export const PROJECT_TYPES: ProjectTypeSelection[] = [
  { value: 'residential', label: 'residential' },
  { value: 'luxury', label: 'luxury' },
  { value: 'commercial', label: 'commercial' },
  { value: 'office', label: 'office' },
];

export const CONSTRUCTION_CONTAINER: ConstructionSelection[] = [
  {
    type: '拆除工程',
    order: 0,
  },
  {
    type: '機電工程',
    order: 1,
  },
  {
    type: '水電工程',
    order: 2,
  },
  {
    type: '地坪工程',
    order: 3,
  },
  {
    type: '泥作工程',
    order: 4,
  },
  {
    type: '門框工程',
    order: 5,
  },
  {
    type: '輕隔間工程',
    order: 6,
  },
  {
    type: '木作工程',
    order: 7,
  },
  {
    type: '金屬工程',
    order: 8,
  },
  {
    type: '玻璃工程',
    order: 9,
  },
  {
    type: '油漆工程',
    order: 10,
  },
  {
    type: '地板工程',
    order: 11,
  },
  {
    type: '防水工程',
    order: 12,
  },
  {
    type: '衛浴設備工程',
    order: 13,
  },
  {
    type: '廚具工程',
    order: 14,
  },
  {
    type: '空調工程',
    order: 15,
  },
  {
    type: '結構補強工程',
    order: 16,
  },
];
