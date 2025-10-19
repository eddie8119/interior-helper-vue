<template>
  <BasicEditDialog
    v-model="dialogVisible"
    :title="t('title.move_note')"
    :is-submitting="isCreatingTask"
    :error-message="errorMessage"
    :is-invalid="isInvalid"
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
          :key="item.id"
          :label="item.name + '工程'"
          :value="item.id"
        />
      </el-select>
    </el-form-item>
  </BasicEditDialog>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { ProjectResponse } from '@/types/response';
import type { TodoItemDraft } from '@/types/todo';

import BasicEditDialog from '@/components/core/dialog/BasicEditDialog.vue';
import { useProjects } from '@/composables/useProjects';
import { useTasks } from '@/composables/useTasks';
import { useProjectsStore } from '@/stores/projects';

const { t } = useI18n();
const projectsStore = useProjectsStore();
const { projects } = storeToRefs(projectsStore);

// Get refetchProjects from useProjects
const { refetchProjects } = useProjects();
const { createTask, isCreatingTask, createError } = useTasks();

const props = defineProps<{
  modelValue: boolean;
  target: TodoItemDraft;
  subject?: string;
}>();

// 獲取所有專案 以及內部工程。如果piani沒有 才用api獲取
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
  'update:target': [value: TodoItemDraft];
  confirm: [];
}>();

const isSubmitting = ref(false);
const errorMessage = ref<string>('');
const selectedProject = ref<string | null>(null);
const selectedConstruction = ref<number | null>(null);
// 為了生成createTask
const selectedProjectId = ref<string | undefined>(undefined);

watch(selectedProject, () => {
  selectedConstruction.value = null;
  selectedProjectId.value = projects.value.find(
    (p: ProjectResponse) => p.title === selectedProject.value
  )?.id;
});

// btn disabled
const isInvalid = computed(() => !selectedProject.value || !selectedConstruction.value);

const constructionContainerOptions = computed(() => {
  if (selectedProject.value) {
    return projects.value.find((p: ProjectResponse) => p.title === selectedProject.value)
      ?.constructionContainer;
  }
  return [];
});

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const onSubmit = async () => {
  if (isInvalid.value) {
    errorMessage.value = '請選擇專案和施工項目';
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    const { content, completed } = props.target;

    // 確保有施工項目可用
    if (!constructionContainerOptions.value || constructionContainerOptions.value.length === 0) {
      errorMessage.value = '所選專案沒有可用的施工項目';
      isSubmitting.value = false;
      return;
    }

    await createTask({
      taskData: {
        title: '待辦事項速記',
        description: content,
        constructionType: selectedConstruction.value!, // 這裡使用 ID 而不是名稱
        status: completed ? 'done' : 'todo',
        projectId: selectedProjectId.value!,
      },
      projectId: selectedProjectId.value!,
    });

    if (createError.value) {
      console.error('Task creation error:', createError.value);
      errorMessage.value = `建立任務失敗: ${createError.value.message || '請確認您有權限執行此操作'}`;
      return;
    }

    // 更新 isMoved 狀態並觸發更新
    emit('update:target', { ...props.target, isMoved: true });

    emit('confirm');
    dialogVisible.value = false;
    ElMessage.success(t('message.created_success'));
  } catch (error) {
    console.error('Failed to create task:', error);
    errorMessage.value = '建立任務失敗，請重試';
    ElMessage.error(t('message.created_failed'));
  } finally {
    isSubmitting.value = false;
  }
};
</script>
