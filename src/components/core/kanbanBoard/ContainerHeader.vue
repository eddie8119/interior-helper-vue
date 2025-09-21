<template>
  <div class="mb-3 flex items-center justify-between">
    <div class="flex items-center">
      <DragHandle />
      <ContainerTitle
        :construction-name="constructionName"
        @update:construction-name="updateConstructionName"
      />
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

    <!-- 刪除確認對話框 -->
    <DeleteDialog
      v-model="showDeleteConstructionDialog"
      :subject="t('project.construction')"
      :target="constructionName"
      @confirm="handleDeleteConstruction"
    />
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import DeleteDialog from '@/components/core/dialog/DeleteDialog.vue';
import ContainerTitle from '@/components/core/kanbanBoard/ContainerTitle.vue';
import DragHandle from '@/components/ui/DragHandle.vue';

defineProps<{
  constructionName: string;
}>();

const emit = defineEmits<{
  (e: 'delete-container'): void;
  (e: 'update:construction-name', name: string): void;
}>();

const { t } = useI18n();
const showDeleteConstructionDialog = ref(false);

// 處理容器名稱更新
const updateConstructionName = (newName: string) => {
  emit('update:construction-name', newName);
};

// 處理刪除工程類型
const handleDeleteConstruction = () => {
  emit('delete-container');
  showDeleteConstructionDialog.value = false;
};
</script>
