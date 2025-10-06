<template>
  <BasicEditDialog
    v-model="dialogVisible"
    :title="props.subject + t('title.delete_confirm')"
    :is-submitting="isSubmitting"
    :error-message="errorMessage"
    :is-invalid="isCrucial ? isInvalid : false"
    @submit="onSubmit"
    @cancel="dialogVisible = false"
  >
    <p class="text-center text-lg">
      {{ t('dialog.delete_confirm') }}
      <span class="font-semibold text-secondary-red">{{ props.subject }}: {{ props.target }}</span>
      ? {{ t('dialog.delete_content') }}
    </p>
    <div v-if="props.isCrucial" class="mt-2 text-center text-lg">
      <p>
        若確認刪除，請在下方輸入 <span class="font-semibold text-red-500">{{ props.target }}</span>
      </p>

      <el-input v-model="typeCheck" :placeholder="t('placeholder.project.project_name')" />
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
const typeCheck = ref<string>('');

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});
const isInvalid = computed(() => typeCheck.value !== props.target);

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
