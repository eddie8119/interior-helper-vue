# DraggableArrayInput 組件文檔

## 概述

`DraggableArrayInput` 是一個支持拖拽排序的陣列輸入組件，基於 `vue3-smooth-dnd` 實現。

## 功能特性

- ✅ 拖拽排序：通過拖拽手柄重新排列項目順序
- ✅ 添加項目：點擊按鈕添加新項目
- ✅ 刪除項目：點擊刪除按鈕移除項目
- ✅ 自定義工廠函數：支持自定義新項目的創建邏輯
- ✅ 錯誤提示：支持顯示每個項目的錯誤信息
- ✅ 插槽支持：支持為每個項目添加額外的輸入欄位

## 組件結構

### 1. 工具函數 (`src/utils/dragDrop.ts`)

提供拖拽排序的核心邏輯：

- `applyDrag<T>()`: 處理拖拽結果並返回重新排序後的陣列
- `generateItemPayload<T>()`: 生成拖拽項目的 payload

### 2. DraggableArrayInput 組件 (`src/components/core/input/DraggableArrayInput.vue`)

可拖拽的陣列輸入組件，包含：

- 拖拽手柄（三條橫線圖標）
- 輸入框
- 刪除按鈕
- 添加按鈕

### 3. 使用範例 (`src/pages/protected/setting/SetAllCommon.vue`)

在設定頁面中使用 `DraggableArrayInput` 來管理 construction 和 unit 列表。

## 使用方法

### 基本用法

\`\`\`vue
<template>
<DraggableArrayInput
    v-model="items"
    :title="'項目列表'"
    :new-item-factory="() => ({ name: '' })"
    :name-placeholder="'請輸入名稱'"
    :add-button-text="'添加項目'"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DraggableArrayInput from '@/components/core/input/DraggableArrayInput.vue';
import type { Item } from '@/components/core/input/DraggableArrayInput.vue';

const items = ref<Item[]>([
  { name: '項目 1' },
  { name: '項目 2' },
  { name: '項目 3' },
]);
</script>

\`\`\`

### 帶有 ID 的項目

\`\`\`vue

<script setup lang="ts">
interface CustomItem extends Item {
  id: string;
}

const items = ref<CustomItem[]>([
  { id: '1', name: '項目 1' },
  { id: '2', name: '項目 2' },
]);

const createNewItem = (): CustomItem => ({
  id: Date.now().toString(),
  name: '',
});
</script>

<template>
  <DraggableArrayInput
    v-model="items"
    :new-item-factory="createNewItem"
    title="自定義項目"
  />
</template>
\`\`\`

### 使用插槽添加額外輸入

\`\`\`vue
<template>
<DraggableArrayInput v-model="items" title="項目列表">
<template #inputs="{ item, index }">
<input
        v-model="item.description"
        type="text"
        placeholder="描述"
        class="input-border input-common p-1"
      />
</template>
</DraggableArrayInput>
</template>
\`\`\`

## Props

| 屬性              | 類型                     | 必填 | 默認值   | 說明                 |
| ----------------- | ------------------------ | ---- | -------- | -------------------- |
| `modelValue`      | `T[]`                    | ✅   | -        | 綁定的陣列數據       |
| `title`           | `string`                 | ✅   | -        | 組件標題             |
| `newItemFactory`  | `() => T`                | ✅   | -        | 創建新項目的工廠函數 |
| `namePlaceholder` | `string`                 | ❌   | `'名稱'` | 名稱輸入框的佔位符   |
| `addButtonText`   | `string`                 | ❌   | `'添加'` | 添加按鈕的文字       |
| `itemErrors`      | `Record<number, string>` | ❌   | `{}`     | 項目錯誤信息         |

## Events

| 事件                | 參數         | 說明                 |
| ------------------- | ------------ | -------------------- |
| `update:modelValue` | `value: T[]` | 當陣列數據變更時觸發 |

## Slots

| 插槽名   | 參數                         | 說明                         |
| -------- | ---------------------------- | ---------------------------- |
| `inputs` | `{ item: T, index: number }` | 為每個項目添加額外的輸入欄位 |

## 樣式自定義

組件使用 scoped CSS，包含以下可自定義的樣式：

- `.drag-handle`: 拖拽手柄樣式
- `.drop-preview`: 拖拽預覽樣式
- `.smooth-dnd-container`: 拖拽容器樣式

## 注意事項

1. **唯一 Key**: 如果項目有 `id` 屬性，組件會使用它作為 key；否則使用索引
2. **拖拽手柄**: 只能通過拖拽手柄（三條橫線圖標）來拖動項目
3. **垂直拖拽**: 目前只支持垂直方向的拖拽排序
4. **響應式**: 組件完全響應式，支持移動設備

## 相關文件

- `src/utils/dragDrop.ts` - 拖拽工具函數
- `src/components/core/input/DraggableArrayInput.vue` - 可拖拽組件
- `src/components/core/input/DraggableArrayInput.vue` - 原始基礎組件（無拖拽功能）
- `src/pages/protected/setting/SetAllCommon.vue` - 使用範例

## 依賴

- `vue3-smooth-dnd`: ^0.0.5
- `vue-i18n`: ^9.14.0
