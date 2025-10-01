<template>
  <el-dialog
    v-model="dialogVisible"
    width="500px"
    :title="title"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    align-center
    @close="onCancel"
  >
    <el-form label-width="110px" class="device-form" @submit.prevent="onSubmit">
      <slot />
    </el-form>

    <!-- Error Message Display -->
    <div v-if="errorMessage" class="error-message">
      <el-alert :title="errorMessage" type="error" show-icon :closable="false" />
    </div>
    <span class="mt-5 flex items-center gap-3">
      <slot name="footer-left" />
      <div class="flex-grow" />
      <slot
        v-if="showFooterButton"
        name="footer"
        :on-cancel="onCancel"
        :on-submit="onSubmit"
        :is-submitting="isSubmitting"
      >
        <TextButton size="md" variant="outline" @click="onCancel">
          {{ t('common.cancel') }}
        </TextButton>

        <TextButton
          variant="primary"
          :disabled="isSubmitting || isInvalid"
          :loading="isSubmitting"
          size="md"
          @click="onSubmit"
        >
          {{ t('common.confirm') }}
        </TextButton>
      </slot>
    </span>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import TextButton from '@/components/core/button/TextButton.vue';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title: string;
    isSubmitting: boolean;
    errorMessage?: string;
    showFooterButton?: boolean;
    isInvalid?: boolean;
  }>(),
  {
    modelValue: false,
    title: '',
    isSubmitting: false,
    errorMessage: '',
    showFooterButton: true,
  }
);

const emit = defineEmits(['update:modelValue', 'submit', 'cancel']);
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});
const { t } = useI18n();

const onSubmit = () => {
  emit('submit');
};

const onCancel = () => {
  emit('cancel');
  emit('update:modelValue', false);
};
</script>

<style lang="scss" scoped>
.flex-grow {
  flex-grow: 1;
}

.error-message {
  margin: 16px 0;

  :deep(.el-alert) {
    margin-bottom: 0;
    border-radius: 4px;
  }

  :deep(.el-alert__title) {
    font-size: 14px;
    line-height: 1.5;
  }
}
</style>
<style>
.el-dialog__header {
  display: flex;
  justify-content: center;

  position: relative;
}

.el-dialog__title {
  flex: none;
  margin-left: 30px;
}

.el-dialog__headerbtn {
  position: absolute;
  right: -3%;
  top: 30%;
  transform: translateY(-50%);
}
</style>
