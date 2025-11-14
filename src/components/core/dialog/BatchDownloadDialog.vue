<template>
  <BasicEditDialog
    v-model="dialogVisible"
    :title="t('title.batch_download')"
    :is-submitting="isSubmitting"
    :error-message="errorMessage"
    :show-footer-button="false"
    @cancel="dialogVisible = false"
  >
    <div class="space-y-4">
      <!-- 控制列：全選勾選框 + 快捷按鈕 + 已選數量 -->
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div class="flex items-center gap-3">
          <input
            ref="masterCheckbox"
            type="checkbox"
            :checked="isAllSelected"
            class="h-5 w-5 rounded border-gray-500 accent-blue-600"
            @change="toggleSelectAll"
          />
          <span class="text-sm text-gray-600">{{ selectedCount }} / {{ totalCount }}</span>
        </div>

        <div class="flex gap-2">
          <TextButton variant="primary" size="sm" class="h-[30px] w-[80px]" @click="selectAll">
            {{ t('button.select_all') }}
          </TextButton>
          <TextButton variant="secondary" size="sm" class="h-[30px] w-[80px]" @click="clearAll">
            {{ t('button.clear_all') }}
          </TextButton>
        </div>
      </div>

      <!-- Projects 列表 -->
      <div class="max-h-[400px] space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-3">
        <div v-if="props.projects.length === 0" class="text-center text-gray-500">
          {{ t('common.none') }}
        </div>
        <div v-for="project in props.projects" :key="project.id" class="flex items-center gap-2">
          <input
            :id="`project-${project.id}`"
            v-model="selectedProjectIds"
            type="checkbox"
            :value="project.id"
            class="h-5 w-5 rounded border-gray-500 accent-blue-600"
          />
          <label :for="`project-${project.id}`" class="flex-1 cursor-pointer text-sm">
            {{ project.title }}
          </label>
        </div>
      </div>

      <!-- 下載按鈕 -->
      <div class="flex justify-end">
        <TextButton
          variant="primary"
          size="sm"
          class="h-[30px] w-[100px]"
          :disabled="selectedProjectIds.length === 0 || isSubmitting"
          @click="handleBatchDownloadProject"
        >
          {{ t('button.download') }}
          <span v-if="selectedCount > 0" class="ml-1">({{ selectedCount }})</span>
        </TextButton>
      </div>
    </div>
  </BasicEditDialog>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { ProjectResponse } from '@/types/response';

import TextButton from '@/components/core/button/TextButton.vue';
import BasicEditDialog from '@/components/core/dialog/BasicEditDialog.vue';
import { createWorkbookWithProjects, downloadWorkbook } from '@/config/excelConfig';

const props = defineProps<{
  modelValue: boolean;
  projects: ProjectResponse[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const { t } = useI18n();

const errorMessage = ref<string>('');
const isSubmitting = ref(false);
const selectedProjectIds = ref<string[]>([]);
const masterCheckbox = ref<HTMLInputElement | null>(null);

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});

// 全選
const selectAll = () => {
  selectedProjectIds.value = props.projects.map((p) => p.id);
};

// 全清
const clearAll = () => {
  selectedProjectIds.value = [];
};

// 計算屬性：數量與狀態
const totalCount = computed(() => props.projects.length);
const selectedCount = computed(() => selectedProjectIds.value.length);
const isAllSelected = computed(
  () => totalCount.value > 0 && selectedCount.value === totalCount.value
);
const isIndeterminate = computed(
  () => selectedCount.value > 0 && selectedCount.value < totalCount.value
);

// 切換全選
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    clearAll();
  } else {
    selectAll();
  }
};

// 維護原生 indeterminate 狀態
const syncMasterIndeterminate = () => {
  if (masterCheckbox.value) masterCheckbox.value.indeterminate = isIndeterminate.value;
};

onMounted(syncMasterIndeterminate);
watch([isIndeterminate, isAllSelected], syncMasterIndeterminate);

/**
 * 批次下載 Projects Excel
 */
const handleBatchDownloadProject = async () => {
  if (selectedProjectIds.value.length === 0) {
    ElMessage.warning(t('message.please_select_project'));
    return;
  }

  try {
    isSubmitting.value = true;
    errorMessage.value = '';

    const selectedProjects = props.projects.filter((p) => selectedProjectIds.value.includes(p.id));

    // 建立 Workbook 並下載
    const workbook = createWorkbookWithProjects(selectedProjects, t);
    await downloadWorkbook(workbook, `Projects_Batch_${Date.now()}.xlsx`);

    ElMessage.success(t('message.download_success'));
    dialogVisible.value = false;
  } catch (error) {
    console.error('批次下載失敗:', error);
    errorMessage.value = t('message.download_failed');
    ElMessage.error(t('message.download_failed'));
  } finally {
    isSubmitting.value = false;
  }
};
</script>
