<template>
  <BasicEditDialog
    v-model="dialogVisible"
    :title="props.subject + t('title.delete_confirm')"
    :is-submitting="isSubmitting"
    :error-message="errorMessage"
    @submit="onSubmit"
    @cancel="dialogVisible = false"
  >
    <p class="text-center text-lg">
      {{ t('dialog.delete_confirm') }}
      <span class="font-semibold text-secondary-red">{{ props.subject }} -{{ props.target }}</span>
      ？
    </p>
    <div v-if="props.isCrucial" class="text-center text-lg text-red-500">
      <!-- {{ t('dialog.delete_crucial') }} -->
      <el-form-item :label="t('label.project.project_name')" :error="titleError">
        <el-input v-model="title" :placeholder="t('placeholder.project.project_name')" />
      </el-form-item>
    </div>
  </BasicEditDialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import BasicEditDialog from '@/components/core/dialog/BasicEditDialog.vue';

const { t } = useI18n();

const props = defineProps<{
  modelValue: boolean;
  isCrucial?: boolean;
  target: string;
  subject?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [];
}>();

const errorMessage = ref<string>('');
const isSubmitting = ref(false);

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
