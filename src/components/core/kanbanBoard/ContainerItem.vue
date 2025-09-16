<template>
  <div class="mx-2 min-w-[300px] max-w-[300px] rounded-lg bg-gray-100 p-3 shadow-sm">
    <div class="mb-3 flex items-center justify-between">
      <div class="flex items-center">
        <div class="container-drag-handle mr-2 cursor-grab rounded-full p-1 hover:bg-gray-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </div>
        <ContainerTitle :name="name" @update:name="updateContainerName" />
      </div>
      <button
        class="rounded-full p-1 text-red-500 hover:bg-red-100"
        title="刪除工程類型"
        @click="showDeleteConstructionDialog = true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>

    <!-- 空容器提示 -->
    <div
      v-if="!isEditing"
      class="flex h-[100px] items-center justify-center rounded-md border border-gray-200 bg-white"
    >
      <span class="text-gray-400">尚無施作項目</span>
    </div>

    <div v-else>
      <AddTaskContainer @close="isEditing = false" />
    </div>

    <!-- 添加施作項目按鈕 -->
    <div class="mt-3 flex justify-center">
      <button
        v-if="!isEditing"
        class="flex items-center justify-center rounded-md bg-blue-100 px-3 py-1 text-blue-700 hover:bg-blue-200"
        @click="isEditing = true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="mr-1 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        施作項目
      </button>
    </div>

    <!-- 刪除確認對話框 -->
    <DeleteDialog
      v-model="showDeleteConstructionDialog"
      :subject="t('project.construction')"
      :target="name"
      @confirm="handleDeleteConstruction"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import DeleteDialog from '@/components/core/dialog/DeleteDialog.vue';
import AddTaskContainer from '@/components/core/kanbanBoard/AddTaskContainer.vue';
import ContainerTitle from '@/components/core/kanbanBoard/ContainerTitle.vue';

defineProps<{
  id: string;
  name: string;
  isDefault: boolean;
}>();

const emit = defineEmits<{
  (e: 'delete-container'): void;
  (e: 'add-task'): void;
  (e: 'update:name', name: string): void;
}>();

const { t } = useI18n();

const showDeleteConstructionDialog = ref(false);
const isEditing = ref(false);

// 處理容器名稱更新
const updateContainerName = (newName: string) => {
  emit('update:name', newName);
};

// 處理刪除工程類型
const handleDeleteConstruction = () => {
  emit('delete-container');
  showDeleteConstructionDialog.value = false;
};
</script>
