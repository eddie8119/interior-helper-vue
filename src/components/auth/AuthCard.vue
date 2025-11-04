<template>
  <div class="flex h-full w-full items-center justify-center">
    <div class="auth-container">
      <div v-if="props.showLogo" class="flex items-center justify-center">
        <img src="@/assets/icons/CompanyLogo.png" alt="logo Icon" class="icon-logo w-[40px]" />
        <span class="text-color-difference ml-1 font-semibold">Designer Helper</span>
      </div>

      <!-- 標題 -->
      <h2 class="my-5 text-center text-[24px] font-semibold">
        <slot name="title" />
      </h2>

      <!-- 這裡放表單內容 -->
      <slot />

      <ElButton
        v-if="props.showSubmitButton"
        type="primary"
        size="large"
        :loading="props.loading"
        :disabled="props.loading || props.isInvalid"
        block
        class="auth-brand-button w-full"
        @click="emit('submit')"
      >
        <slot name="button-text"> {{ t('button.submit') }}</slot>
      </ElButton>

      <!-- 消息 -->
      <div v-if="props.errorMessage" class="mt-2 text-center">
        <p class="text-secondary-red">{{ props.errorMessage }}</p>
      </div>

      <div v-if="props.message" class="mt-2 text-center">
        <p class="text-secondary-green">{{ props.message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const props = withDefaults(
  defineProps<{
    errorMessage?: string | null;
    message?: string | null;
    loading?: boolean;
    showLogo?: boolean;
    isInvalid?: boolean;
    showSubmitButton?: boolean;
  }>(),
  {
    errorMessage: '',
    message: '',
    showLogo: true,
    isInvalid: false,
    showSubmitButton: true,
  }
);

const emit = defineEmits<{
  (e: 'submit'): void;
}>();

const { t } = useI18n();
</script>

<style lang="scss" scoped></style>
