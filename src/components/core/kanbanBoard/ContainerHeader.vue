<template>
  <div class="mb-3 flex items-center justify-between">
    <div class="flex items-center">
      <DragHandle handle-class="container-drag-handle" />
      <ContainerTitle
        :construction-name="constructionName"
        @update:construction-name="updateConstructionName"
      />
      <span class="ml-1">({{ tasksLength }})</span>
    </div>
    <TrashButton @click="showDeleteConstructionDialog = true" />

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
import TrashButton from '@/components/ui/TrashButton.vue';

defineProps<{
  constructionName: string;
  tasksLength: number;
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
