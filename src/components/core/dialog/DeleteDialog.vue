<template>
  <BasicEditDialog
    v-model="dialogVisible"
    :title="t('title.delete_confirm')"
    :is-submitting="isSubmitting"
    :error-message="errorMessage"
    @submit="onSubmit"
    @cancel="onCancel"
  >
    <p class="mb-4 text-center">
      確定要刪除 <span class="font-semibold text-secondary-red">{{ props.target }}</span> 嗎？
    </p>
  </BasicEditDialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import BasicEditDialog from '@/components/core/dialog/BasicEditDialog.vue';

const { t } = useI18n();

const props = defineProps<{
  modelValue: boolean;
  target: string;
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
    // 觸發確認刪除事件
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

const onCancel = () => {
  emit('update:modelValue', false);
};
</script>
