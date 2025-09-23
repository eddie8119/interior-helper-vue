<template>
  <div class="flex flex-col space-y-3">
    <!-- 基本信息輸入 -->
    <div>
      <input
        ref="inputRef"
        v-model="title"
        type="text"
        class="block w-full rounded-lg border border-gray-300 bg-white p-2 text-lg text-gray-900 focus:border-blue-500 focus:ring-blue-500"
        :placeholder="t('placeholder.project.task')"
      />
      <span v-if="props.errors.title" class="text-sm text-red-500">{{ props.errors.title }}</span>
    </div>
    <div>
      <textarea
        ref="textareaRef"
        v-model="description"
        class="block h-[120px] w-full rounded-lg border border-gray-300 bg-white p-2 text-lg text-gray-900 focus:border-blue-500 focus:ring-blue-500"
        :placeholder="t('placeholder.project.taskDescription')"
      />
      <span v-if="props.errors.description" class="text-sm text-red-500">
        {{ props.errors.description }}
      </span>
    </div>

    <!-- 展開更多設定按鈕 -->
    <div class="flex items-center justify-center">
      <button
        class="flex items-center text-blue-600 hover:text-blue-800 focus:outline-none"
        @click="toggleMoreSettings"
      >
        <span class="mr-1">{{ showMoreSettings ? '- Less' : '+ More' }}(可選) </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          :class="{ 'rotate-180 transform': showMoreSettings }"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    </div>

    <!-- 更多設定區域 -->
    <div v-if="showMoreSettings" class="space-y-4 rounded-md border border-gray-200 bg-gray-50 p-3">
      <!-- 材料 -->
      <MaterialInput
        v-model="materials"
        :item-errors="materialErrors"
        @add="handleAddMaterial"
        @remove="handleRemoveMaterial"
      />

      <!-- 提醒 -->
      <div class="space-y-2">
        <h3 class="font-medium text-gray-700">設定提醒 (可選)</h3>
        <el-date-picker
          v-model="reminderDatetime"
          type="datetime"
          format="YYYY-MM-DD HH:mm:ss"
          placeholder="選擇日期和時間"
          class="w-full"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElDatePicker } from 'element-plus';
import { useField } from 'vee-validate';
import { nextTick, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Material, TaskData } from '@/types/task';

import MaterialInput from '@/components/core/input/MaterialInput.vue';

// PROPS
const props = defineProps<{
  initialData?: TaskData;
  constructionName: string;
  errors: {
    title?: string;
    description?: string;
  };
}>();

const { t } = useI18n();

// REFS
const inputRef = ref<HTMLInputElement | null>(null);
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const showMoreSettings = ref(false);
const materialErrors = ref<Record<number, string>>({});

// VEE-VALIDATE
const { value: title } = useField<string>('title');
const { value: description } = useField<string>('description');
const { value: materials } = useField<Material[]>('materials');
const { value: reminderDatetime } = useField<number | undefined>('reminderDatetime');

// 切換顯示更多設定
const toggleMoreSettings = () => {
  // 如果要關閉更多設定區域，先清除內容
  if (showMoreSettings.value) {
    // 清除材料列表
    materials.value = [];
    // 清除提醒日期時間
    reminderDatetime.value = undefined;
    // 清除驗證錯誤
    materialErrors.value = {};
  } else if (props.initialData?.materials?.length || props.initialData?.reminderDatetime) {
    // 如果是打開更多設定，且有初始數據，則恢復初始數據
    materials.value = props.initialData.materials || [];
    reminderDatetime.value = props.initialData.reminderDatetime || undefined;
  }

  // 切換顯示狀態
  showMoreSettings.value = !showMoreSettings.value;
};

// 材料相關處理方法
const handleAddMaterial = () => {
  // 可以在這裡添加額外的邏輯，如果需要的話
  clearMaterialErrors();
};

const handleRemoveMaterial = (index: number) => {
  // 移除對應的錯誤信息
  if (materialErrors.value[index]) {
    const newErrors = { ...materialErrors.value };
    delete newErrors[index];

    // 重新調整索引
    const adjustedErrors: Record<number, string> = {};
    Object.keys(newErrors).forEach((key) => {
      const numKey = parseInt(key);
      if (numKey > index) {
        adjustedErrors[numKey - 1] = newErrors[numKey];
      } else {
        adjustedErrors[numKey] = newErrors[numKey];
      }
    });

    materialErrors.value = adjustedErrors;
  }
};

// 清除材料驗證錯誤
const clearMaterialErrors = () => {
  materialErrors.value = {};
};

// 驗證材料資料 - 現在使用 Zod 的驗證邏輯
const validateMaterials = () => {
  // 清除之前的錯誤
  clearMaterialErrors();

  // 所有驗證都由 vee-validate 和 Zod 處理
  // 因此我們只需要確保材料數據格式正確
  return true;
};

// 提供方法給父組件
defineExpose({
  validateMaterials,
  clearMaterialErrors,
  focusInput: () => {
    nextTick(() => {
      inputRef.value?.focus();
    });
  },
  handleAddMaterial,
  handleRemoveMaterial,
});

// 在組件掛載後聚焦輸入框
onBeforeMount(() => {
  nextTick(() => {
    inputRef.value?.focus();
  });
});
</script>

<style scoped></style>
