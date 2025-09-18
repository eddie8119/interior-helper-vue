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
      <span v-if="errors.title" class="text-sm text-red-500">{{ errors.title }}</span>
    </div>
    <div>
      <textarea
        ref="textareaRef"
        v-model="description"
        class="block h-[120px] w-full rounded-lg border border-gray-300 bg-white p-2 text-lg text-gray-900 focus:border-blue-500 focus:ring-blue-500"
        :placeholder="t('placeholder.project.taskDescription')"
      />
      <span v-if="errors.description" class="text-sm text-red-500">{{ errors.description }}</span>
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
      <div class="space-y-2">
        <h3 class="font-medium text-gray-700">材料 (可選)</h3>
        <div v-for="(material, index) in materials" :key="index" class="flex flex-col space-y-2">
          <div class="flex items-center gap-2">
            <input
              v-model="material.name"
              type="text"
              class="flex-1 rounded-md border border-gray-300 p-1 text-sm"
              placeholder="材料名稱"
            />
            <button
              class="text-red-500 hover:text-red-700"
              title="移除材料"
              @click="removeMaterial(index)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex items-center">
              <span class="mr-1 text-xs text-gray-500">數量:</span>
              <input
                v-model.number="material.quantity"
                type="number"
                min="1"
                class="w-16 rounded-md border border-gray-300 p-1 text-sm"
                placeholder="輸入數量"
              />
            </div>
            <div class="flex items-center">
              <span class="mr-1 text-xs text-gray-500">單價:</span>
              <input
                v-model.number="material.unitPrice"
                type="number"
                min="0"
                class="w-20 rounded-md border border-gray-300 p-1 text-sm"
                placeholder="輸入單價"
              />
            </div>
          </div>
          <div v-if="materialErrors[index]" class="text-xs text-red-500">
            {{ materialErrors[index] }}
          </div>
        </div>
        <button
          class="flex w-full items-center justify-center rounded-md border border-dashed border-gray-300 py-1 text-sm text-gray-500 hover:bg-gray-100"
          @click="addMaterial"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="mr-1 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          添加材料
        </button>
      </div>

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

// 添加材料
const addMaterial = () => {
  if (!materials.value) {
    materials.value = [];
  }
  materials.value.push({
    name: '',
    quantity: undefined,
    unitPrice: undefined,
  });
};

// 移除材料
const removeMaterial = (index: number) => {
  materials.value.splice(index, 1);
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
});

// 在組件掛載後聚焦輸入框
onBeforeMount(() => {
  nextTick(() => {
    inputRef.value?.focus();
  });
});
</script>

<style scoped></style>
