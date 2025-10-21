<template>
  <BasicEditDialog
    v-model="dialogVisible"
    :title="t('title.share') + props.subject"
    :is-submitting="isSubmitting"
    :error-message="errorMessage"
    :show-footer-button="false"
    @cancel="dialogVisible = false"
  >
    <div class="space-y-4">
      <!-- 啟用分享開關 -->
      <div class="flex items-center justify-between rounded-lg border p-4">
        <div>
          <p class="font-medium">{{ t('dialog.enable_project_sharing') }}</p>
          <p class="text-sm text-gray-500">{{ t('dialog.share_description') }}</p>
        </div>
        <ElSwitch v-model="isShared" :loading="isToggling" @change="handleToggleShare" />
      </div>

      <!-- 分享連結區域 -->
      <div v-if="isShared" class="space-y-2">
        <p class="text-sm font-medium text-gray-700">
          {{ t('dialog.share_project_link') }}
        </p>
        <div class="flex items-center gap-2">
          <ElInput v-model="shareLink" readonly />
          <TextButton variant="primary" size="sm" class="h-[30px] w-[70px]" @click="copyShareLink">
            {{ t('button.copy') }}
          </TextButton>
        </div>
      </div>

      <!-- 未啟用分享提示 -->
      <div v-else class="rounded-lg p-4 text-center text-sm">
        {{ t('message.sign.share_disabled_hint') }}
      </div>
    </div>
  </BasicEditDialog>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { projectApi } from '@/api/project';
import TextButton from '@/components/core/button/TextButton.vue';
import BasicEditDialog from '@/components/core/dialog/BasicEditDialog.vue';

const props = defineProps<{
  modelValue: boolean;
  projectId: string;
  subject?: string;
  initialIsShared?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [];
  'update:isShared': [value: boolean];
}>();

const { t } = useI18n();

const errorMessage = ref<string>('');
const isSubmitting = ref(false);
const isShared = ref(props.initialIsShared || false);
const isToggling = ref(false);

watch(
  () => props.initialIsShared,
  (newValue: boolean) => {
    isShared.value = newValue || false;
  }
);

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});

const shareLink = computed(() => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/shared/project/${props.projectId}`;
});

const handleToggleShare = async () => {
  try {
    isToggling.value = true;
    const { success, message } = await projectApi.toggleProjectShare(props.projectId);

    if (success) {
      ElMessage.success(message || t('message.update_success'));
      emit('update:isShared', isShared.value);
    } else {
      // 恢復原狀態
      isShared.value = !isShared.value;
      ElMessage.error(message || t('message.update_failed'));
    }
  } catch (error) {
    // 恢復原狀態
    isShared.value = !isShared.value;
    ElMessage.error(t('message.update_failed'));
  } finally {
    isToggling.value = false;
  }
};

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
