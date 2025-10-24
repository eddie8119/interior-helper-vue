import type { ConstructionSelection, SelectorOption } from '@/types/selection';

export const PROJECT_TYPES: SelectorOption[] = [
  { value: 'residential' },
  { value: 'luxury' },
  { value: 'commercial' },
  { value: 'office' },
] as const;

export const CONSTRUCTION_CONTAINER: ConstructionSelection[] = [
  {
    name: '拆除',
    id: '0',
  },
  {
    name: '機電',
    id: '1',
  },
  {
    name: '水電',
    id: '2',
  },
  {
    name: '地坪',
    id: '3',
  },
  {
    name: '泥作',
    id: '4',
  },
  {
    name: '門框',
    id: '5',
  },
  {
    name: '輕隔間',
    id: '6',
  },
  {
    name: '木作',
    id: '7',
  },
  {
    name: '金屬',
    id: '8',
  },
  {
    name: '玻璃',
    id: '9',
  },
  {
    name: '油漆',
    id: '10',
  },
  {
    name: '地板',
    id: '11',
  },
  {
    name: '防水',
    id: '12',
  },
  {
    name: '衛浴設備',
    id: '13',
  },
  {
    name: '廚具',
    id: '14',
  },
  {
    name: '空調',
    id: '15',
  },
  {
    name: '結構補強',
    id: '16',
  },
];

export const STATUS_FILTER_OPTIONS: SelectorOption[] = [
  { value: 'all' },
  { value: 'todo' },
  { value: 'inProgress' },
  { value: 'done' },
] as const;

export type TaskFilterStatus = (typeof STATUS_FILTER_OPTIONS)[number]['value'];

export const TASK_DISPLAY_OPTIONS: SelectorOption[] = [
  { value: 'all' },
  { value: 'content' },
  { value: 'materials' },
] as const;

export type TaskCardDisplayMode = (typeof TASK_DISPLAY_OPTIONS)[number]['value'];

export const TODO_FILTER: SelectorOption[] = [
  { value: 'all' },
  { value: 'done' },
  { value: 'todo' },
] as const;

export const COLLABORATOR_ROLE_OPTIONS: SelectorOption[] = [
  { value: 'viewer' },
  { value: 'editor' },
  { value: 'manager' },
] as const;
