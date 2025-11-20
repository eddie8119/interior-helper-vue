<template>
  <ElFormItem :label="t('label.project.floor_plan')" :error="errorMessage">
    <div class="space-y-4">
      <!-- 上傳區域 -->
      <div class="rounded-lg border-2 border-dashed border-gray-300 p-6">
        <div class="text-center">
          <div
            class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-gray-50"
          >
            <svg
              class="h-8 w-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <p class="mb-2 text-sm text-gray-600">{{ t('placeholder.project.floor_plan') }}</p>
          <ElButton type="primary" @click="triggerFileInput">
            {{ t('button.upload_image') }}
          </ElButton>
          <p class="mt-2 text-xs text-gray-500">{{ t('label.project.supported_formats') }}</p>
        </div>
      </div>

      <!-- 圖片預覽區域 (水平滑動) -->
      <div v-if="previews.length > 0" class="space-y-2">
        <div class="flex items-center justify-between">
          <p class="text-sm font-medium text-gray-700">已上傳 {{ previews.length }} 張圖片</p>
          <ElButton type="danger" size="small" @click="clearAllImages"> 清空所有 </ElButton>
        </div>
        <div class="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div class="flex gap-4">
            <div v-for="(preview, index) in previews" :key="index" class="relative flex-shrink-0">
              <img
                :src="preview"
                alt="Floor plan preview"
                class="h-40 w-40 rounded-lg border border-gray-300 object-cover"
              />
              <div
                class="bg-black/50 absolute left-2 top-2 flex items-center justify-center rounded px-2 py-1 text-xs text-white"
              >
                {{ index + 1 }}
              </div>
              <ElButton
                type="danger"
                size="small"
                class="absolute right-2 top-2"
                @click="removeImage(index)"
              >
                ✕
              </ElButton>
            </div>
          </div>
        </div>
      </div>

      <input
        ref="fileInputRef"
        type="file"
        accept="image/*"
        multiple
        class="hidden"
        @change="handleFileSelect"
      />
    </div>
  </ElFormItem>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { useField } from 'vee-validate';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

interface Props {
  fieldName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  fieldName: 'floorPlanUrls',
});

const { t } = useI18n();
const fileInputRef = ref<HTMLInputElement>();
const previews = ref<string[]>([]);

const { value, errorMessage } = useField(props.fieldName);

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (files) {
    Array.from(files).forEach((file) => {
      handleFileUpload(file);
    });
  }
};

const handleFileUpload = (file: File) => {
  // 驗證檔案類型
  if (!file.type.startsWith('image/')) {
    ElMessage.error(t('message.error.invalid_file_type'));
    return;
  }

  // 驗證檔案大小 (5MB)
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error(t('message.error.file_too_large'));
    return;
  }

  // 創建預覽
  const reader = new FileReader();
  reader.onload = (e) => {
    const result = e.target?.result as string;
    previews.value.push(result);
    value.value = previews.value; // 更新表單值為陣列
  };
  reader.readAsDataURL(file);
};

const removeImage = (index: number) => {
  previews.value.splice(index, 1);
  value.value = previews.value;
};

const clearAllImages = () => {
  previews.value = [];
  value.value = [];
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};
</script>
