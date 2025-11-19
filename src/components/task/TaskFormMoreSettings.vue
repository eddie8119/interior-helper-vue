<template>
  <div class="input-border space-y-4 p-3">
    <!-- 材料 -->
    <MaterialInput
      v-model="materials"
      :item-errors="itemErrors"
      @add="() => emit('add-material')"
      @remove="(index) => emit('remove-material', index)"
    />

    <!-- 提醒時間 -->
    <div class="flex flex-col">
      <Label :label="t('label.reminder_date_time')" />
      <ElDatePicker
        v-model="reminderDateTime"
        v-inputmode-none="isCoarsePointer"
        type="datetime"
        format="YYYY-MM-DD HH:mm:ss"
        value-format="YYYY-MM-DD HH:mm:ss"
        :placeholder="t('placeholder.select_date_and_time')"
        :editable="!isCoarsePointer"
        class="w-full"
      />
    </div>

    <!-- 截止時間 -->
    <div class="flex flex-col">
      <Label :label="t('label.end_date_time')" />
      <ElDatePicker
        v-model="endDateTime"
        v-inputmode-none="isCoarsePointer"
        type="datetime"
        format="YYYY-MM-DD HH:mm:ss"
        value-format="YYYY-MM-DD HH:mm:ss"
        :placeholder="t('placeholder.select_date')"
        :editable="!isCoarsePointer"
        class="w-full"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElDatePicker } from 'element-plus';
import { useField } from 'vee-validate';
import { useI18n } from 'vue-i18n';

import type { Material } from '@/types/task';

import MaterialInput from '@/components/core/input/MaterialInput.vue';
import Label from '@/components/core/title/Label.vue';
import vInputmodeNone from '@/directives/vInputmodeNone';
import { hasCoarsePointer } from '@/utils/device';

defineProps<{
  itemErrors: Record<number, string>;
}>();

const emit = defineEmits<{
  'add-material': [];
  'remove-material': [index: number];
}>();

const { t } = useI18n();

const { value: materials } = useField<Material[]>('materials');
const { value: reminderDateTime } = useField<string | undefined>('reminderDateTime');
const { value: endDateTime } = useField<string | undefined>('endDateTime');

const isCoarsePointer = hasCoarsePointer();
</script>

<style scoped></style>
