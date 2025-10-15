<template>
  <div class="notification-view">
    <el-tabs v-model="activeTab">
      <el-tab-pane :label="t('notification.reminderManager')" name="reminders">
        <ReminderManager />
      </el-tab-pane>
      <el-tab-pane :label="t('settings.notificationSettings')" name="settings">
        <UserSettingsForm />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ReminderManager from '@/components/notification/ReminderManager.vue';
import UserSettingsForm from '@/components/notification/UserSettingsForm.vue';

const { t } = useI18n();
const activeTab = ref('reminders');
</script>

<style lang="scss" scoped>
.notification-view {
  padding: 1rem;
}
</style>
