import type { ConstructionSelection, ProjectTypeSelection } from '@/types/selection';

export const PROJECT_TYPES: ProjectTypeSelection[] = [
  { value: 'residential', label: 'residential' },
  { value: 'luxury', label: 'luxury' },
  { value: 'commercial', label: 'commercial' },
  { value: 'office', label: 'office' },
];

export const CONSTRUCTION_CONTAINER: ConstructionSelection[] = [
  {
    id: '拆除工程',
    type: '拆除工程',
    order: 0,
  },
  {
    id: '機電工程',
    type: '機電工程',
    order: 1,
  },
  {
    id: '水電工程',
    type: '水電工程',
    order: 2,
  },
  {
    id: '地坪工程',
    type: '地坪工程',
    order: 3,
  },
  {
    id: '泥作工程',
    type: '泥作工程',
    order: 4,
  },
  {
    id: '門框工程',
    type: '門框工程',
    order: 5,
  },
  {
    id: '輕隔間工程',
    type: '輕隔間工程',
    order: 6,
  },
  {
    id: '木作工程',
    type: '木作工程',
    order: 7,
  },
  {
    id: '金屬工程',
    type: '金屬工程',
    order: 8,
  },
  {
    id: '玻璃工程',
    type: '玻璃工程',
    order: 9,
  },
  {
    id: '油漆工程',
    type: '油漆工程',
    order: 10,
  },
  {
    id: '地板工程',
    type: '地板工程',
    order: 11,
  },
  {
    id: '防水工程',
    type: '防水工程',
    order: 12,
  },
  {
    id: '衛浴設備工程',
    type: '衛浴設備工程',
    order: 13,
  },
  {
    id: '廚具工程',
    type: '廚具工程',
    order: 14,
  },
  {
    id: '空調工程',
    type: '空調工程',
    order: 15,
  },
  {
    id: '結構補強工程',
    type: '結構補強工程',
    order: 16,
  },
];
