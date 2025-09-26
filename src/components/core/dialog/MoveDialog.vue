<template>
  <BasicEditDialog
    v-model="dialogVisible"
    :title="t('title.move_note')"
    :is-submitting="isCreating"
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
import { storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

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
const { createTask, isCreating, createError } = useTasks();

const props = defineProps<{
  modelValue: boolean;
  target: TodoItemDraft;
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
  'update:target': [value: TodoItemDraft];
  confirm: [];
}>();

const isSubmitting = ref(false);
const errorMessage = ref<string>('');
const selectedProject = ref<string | null>(null);
const selectedConstruction = ref<string | null>(null);
// 為了生成createTask
const selectedProjectId = ref<string | undefined>(undefined);

watch(selectedProject, () => {
  selectedConstruction.value = null;
  selectedProjectId.value = projects.value.find((p) => p.title === selectedProject.value)?.id;
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
  if (!selectedProjectId.value || !selectedConstruction.value) {
    errorMessage.value = '請選擇專案和施工項目';
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    const { content, completed } = props.target;

    await createTask({
      taskData: {
        title: '待辦事項速記',
        description: content,
        constructionType: selectedConstruction.value!,
        status: completed ? 'done' : 'todo',
        projectId: selectedProjectId.value!,
      },
      projectId: selectedProjectId.value!,
    });

    if (createError.value) {
      throw createError.value;
    }

    // 更新 isMoved 狀態並觸發更新
    emit('update:target', { ...props.target, isMoved: true });

    // 觸發確認事件
    emit('confirm');
    // 關閉彈窗
    dialogVisible.value = false;
  } catch (error) {
    console.error('Failed to create task:', error);
    errorMessage.value = '建立任務失敗，請重試';
  } finally {
    isSubmitting.value = false;
  }
};
</script>
