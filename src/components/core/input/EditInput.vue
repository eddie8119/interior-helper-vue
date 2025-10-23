<template>
  <div v-if="!isEditing" class="flex items-center justify-between">
    <span>{{ modelValue }}</span>
    <TextButton variant="primary" size="md" @click="handleEdit">
      {{ t('button.edit') }}
    </TextButton>
  </div>
  <div v-else class="flex items-center gap-2">
    <FormInput v-model="editingValue" :placeholder="placeholder" :name="name" :type="type" />
    <TextButton
      variant="primary"
      :loading="isLoading"
      :disabled="isLoading"
      size="md"
      @click="handleSave"
    >
      {{ t('button.save') }}
    </TextButton>

    <TextButton size="md" variant="outline" @click="handleCancel">
      {{ t('button.cancel') }}
    </TextButton>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import TextButton from '@/components/core/button/TextButton.vue';
import FormInput from '@/components/core/input/FormInput.vue';

interface Props {
  modelValue: string;
  placeholder: string;
  name: string;
  type?: string;
  isLoading?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
  (e: 'save', value: string): Promise<void>;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  isLoading: false,
});

const emit = defineEmits<Emits>();

const { t } = useI18n();

const isEditing = ref(false);
const editingValue = ref(props.modelValue);

watch(
  () => props.modelValue,
  (newValue) => {
    editingValue.value = newValue;
  }
);

const handleEdit = () => {
  isEditing.value = true;
};

const handleCancel = () => {
  isEditing.value = false;
  editingValue.value = props.modelValue;
};

const handleSave = async () => {
  if (!editingValue.value.trim()) {
    ElMessage.warning(t('message.validation.required'));
    return;
  }

  if (editingValue.value === props.modelValue) {
    isEditing.value = false;
    return;
  }

  try {
    await emit('save', editingValue.value);
    emit('update:modelValue', editingValue.value);
    isEditing.value = false;
  } catch (err) {
    console.error('Failed to save:', err);
  }
};
</script>

<style lang="scss" scoped></style>
