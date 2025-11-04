<template>
  <div class="flex items-center gap-2">
    <!-- <img :src="showIconUrl" :alt="`${props.status}_icon`" class="w-12" /> -->
    <span class="rounded-full bg-secondary-red px-2 py-0.5 text-xs font-bold text-white">
      {{ t(`label.status.${showIndex}`) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { TaskTimeReminderStatus } from '@/types/task';

defineProps<{ showIndex: TaskTimeReminderStatus }>();

const { t } = useI18n();
</script>
