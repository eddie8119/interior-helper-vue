<template>
  <BasicEditDialog
    v-model="dialogVisible"
    :title="t('title.move_note')"
    :is-submitting="isSubmitting"
    :error-message="errorMessage"
    @submit="onSubmit"
    @cancel="dialogVisible = false"
  >
    <p class="text-center text-lg">
      {{ t('dialog.move_note_to_project') }}
    </p>
    <el-form-item :label="t('label.project.project')">
      <el-select
        v-model="selectedProject"
        value-key="id"
        :placeholder="t('placeholder.project.project')"
      >
        <el-option
          v-for="item in projects"
          :key="item.id"
          :label="item.title"
          :value="item.title"
        />
      </el-select>
    </el-form-item>
    <el-form-item :label="t('label.project.construction')">
      <el-select
        v-model="selectedConstruction"
        :placeholder="t('placeholder.project.construction')"
        :disabled="!selectedProject"
      >
        <el-option
          v-for="item in constructionContainerOptions"
          :key="item"
          :label="item"
          :value="item"
        />
      </el-select>
    </el-form-item>
  </BasicEditDialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';

import BasicEditDialog from '@/components/core/dialog/BasicEditDialog.vue';
import { useProjectsStore } from '@/stores/projects';
import { useProjects } from '@/composables/useProjects';

const { t } = useI18n();
const projectsStore = useProjectsStore();
const { projects } = storeToRefs(projectsStore);

// Get refetchProjects from useProjects
const { refetchProjects } = useProjects();

const props = defineProps<{
  modelValue: boolean;
  target: string;
  subject?: string;
}>();

// 如果piani沒有 才用api獲取
watch(
  () => props.modelValue,
  async (isOpen: boolean) => {
    if (isOpen && projects.value.length === 0) {
      await refetchProjects();
    }
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [];
}>();

const errorMessage = ref<string>('');
const isSubmitting = ref(false);
const selectedProject = ref<string | null>(null);
const selectedConstruction = ref<string | null>(null);

watch(selectedProject, () => {
  selectedConstruction.value = null;
});

const constructionContainerOptions = computed(() => {
  if (selectedProject.value) {
    return projects.value.find((p) => p.title === selectedProject.value)?.constructionContainer;
  }
  return [];
});

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const onSubmit = async () => {
  try {
    isSubmitting.value = true;
    // 觸發確認刪除事
    emit('confirm');
    // 關閉彈窗
    dialogVisible.value = false;
  } catch (error) {
    console.error('Failed to delete item:', error);
    errorMessage.value = '刪除失敗，請重試';
  } finally {
    isSubmitting.value = false;
  }
};
</script>
