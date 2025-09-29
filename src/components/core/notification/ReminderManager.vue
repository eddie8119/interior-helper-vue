<template>
  <div class="reminder-manager">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-xl font-semibold">{{ t('notification.reminderManager') }}</h2>
      <div class="flex space-x-2">
        <el-button type="primary" :loading="isChecking" @click="handleCheckReminders">
          {{ t('notification.checkReminders') }}
        </el-button>
        <el-button type="success" :loading="isLoadingReminders" @click="refetchReminders">
          {{ t('common.refresh') }}
        </el-button>
      </div>
    </div>

    <el-alert
      v-if="checkSuccess"
      type="success"
      :title="t('notification.checkSuccess', { count: checkCount })"
      show-icon
      class="mb-4"
    />

    <el-table
      v-loading="isLoadingReminders"
      :data="pendingReminders || []"
      border
      style="width: 100%"
      empty-text="No pending reminders"
    >
      <el-table-column prop="title" :label="t('task.title')" min-width="150" />
      <el-table-column :label="t('task.project')" min-width="150">
        <template #default="scope">
          {{ scope.row.Projects?.title || '-' }}
        </template>
      </el-table-column>
      <el-table-column :label="t('task.reminderTime')" min-width="180">
        <template #default="scope">
          <div class="flex items-center">
            <el-icon class="mr-1"><Clock /></el-icon>
            {{ formatDateTime(scope.row.reminder_datetime) }}
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="t('task.status')" width="120">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('notification.reminderStatus')" width="150">
        <template #default="scope">
          <div class="flex items-center">
            <el-tag
              v-if="scope.row.line_reminder_sent"
              type="success"
              effect="dark"
              size="small"
              class="mr-1"
            >
              LINE
            </el-tag>
            <el-tag v-else type="info" effect="plain" size="small" class="mr-1"> LINE </el-tag>
            <el-tag v-if="scope.row.email_reminder_sent" type="success" effect="dark" size="small">
              Email
            </el-tag>
            <el-tag v-else type="info" effect="plain" size="small"> Email </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="t('common.actions')" width="120" fixed="right">
        <template #default="scope">
          <el-button
            type="primary"
            size="small"
            :loading="isResetting"
            @click="handleResetReminder(scope.row.id)"
          >
            {{ t('notification.reset') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div
      v-if="pendingReminders && pendingReminders.length > 0"
      class="mt-4 text-right text-sm text-gray-500"
    >
      {{ t('common.lastUpdated') }}: {{ formatDateTime(new Date(remindersUpdatedAt)) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { Clock } from '@element-plus/icons-vue';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useNotifications } from '@/composables/useNotifications';

const { t } = useI18n();

const {
  pendingReminders,
  isLoadingReminders,
  refetchReminders,
  remindersUpdatedAt,
  checkReminders,
  isChecking,
  resetReminderStatus,
  isResetting,
} = useNotifications();

const checkSuccess = ref(false);
const checkCount = ref(0);

// 格式化日期時間
const formatDateTime = (dateTime: string | Date) => {
  if (!dateTime) return '-';
  const date = new Date(dateTime);
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 根據任務狀態獲取標籤類型
const getStatusType = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'in_progress':
      return 'warning';
    case 'pending':
      return 'info';
    default:
      return 'info';
  }
};

// 手動檢查提醒
const handleCheckReminders = async () => {
  const result = await checkReminders();
  if (result) {
    checkSuccess.value = result.success;
    checkCount.value = result.count;
    setTimeout(() => {
      checkSuccess.value = false;
    }, 5000);
  }
};

// 重置提醒狀態
const handleResetReminder = async (taskId: string) => {
  await resetReminderStatus(taskId);
};
</script>

<style lang="scss" scoped>
.reminder-manager {
  padding: 1rem;
}
</style>
