<template>
  <BasicEditDialog
    v-model="dialogVisible"
    :title="t('title.share') + props.subject"
    :is-submitting="isSubmitting"
    :error-message="errorMessage"
    :show-footer-button="false"
    @cancel="dialogVisible = false"
  >
    <p class="mb-2 text-lg">
      {{ t('dialog.share_project_link') }}
    </p>
    <div class="flex items-center gap-2">
      <el-input v-model="shareLink" readonly />
      <el-button type="primary" @click="copyShareLink">
        {{ t('button.copy') }}
      </el-button>
    </div>
  </BasicEditDialog>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import BasicEditDialog from '@/components/core/dialog/BasicEditDialog.vue';

const { t } = useI18n();

const props = defineProps<{
  modelValue: boolean;
  projectId: string;
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

const shareLink = computed(() => {
  // Generate a shareable link based on your application's URL structure
  const baseUrl = window.location.origin;
  return `${baseUrl}/shared/project/${props.projectId}`;
});

const copyShareLink = () => {
  navigator.clipboard
    .writeText(shareLink.value)
    .then(() => {
      ElMessage.success(t('message.link_copied'));
    })
    .catch(() => {
      ElMessage.error(t('message.copy_failed'));
    });
};
</script>
