<template>
  <el-card class="panel-container">
    <template #header>
      <div class="flex items-center">
        <el-avatar :size="50" class="mr-4">
          {{ username?.charAt(0)?.toUpperCase() || 'U' }}
        </el-avatar>
        <H1Title :title="username" />
      </div>
    </template>

    <el-skeleton :loading="loading" animated>
      <template #default>
        <div class="profile-info space-y-6">
          <div class="info-section">
            <el-descriptions :column="1" border>
              <el-descriptions-item :label="t('label.user.username')">
                <div class="flex items-center">
                  <span>{{ username }}</span>
                </div>
              </el-descriptions-item>
              <el-descriptions-item :label="t('label.user.email')">
                <div class="flex items-center">
                  <span>{{ email }}</span>
                </div>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </template>
    </el-skeleton>
  </el-card>
</template>

<script setup lang="ts">
import { onActivated, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { userApi } from '@/api/user';
import H1Title from '@/components/core/title/H1Title.vue';

const { t } = useI18n();

const email = ref<string>('');
const username = ref<string>('');
const loading = ref(true);

const fetchUserProfile = async (showLoader: boolean) => {
  if (showLoader) {
    loading.value = true;
  }
  try {
    const { data: apiResponseData } = await userApi.getUserProfile();
    if (apiResponseData?.user) {
      email.value = apiResponseData.user.email;
      username.value = apiResponseData.user.name;
    }
  } finally {
    if (showLoader) {
      loading.value = false;
    }
  }
};

// todo
// onMounted is called only once when the component is first created.
// We show the loader on the initial fetch.
onMounted(() => {
  fetchUserProfile(true);
});

// onActivated is called when a kept-alive component is re-inserted into the DOM.
// We refresh the data in the background without showing the loader.
onActivated(() => {
  // The onMounted hook handles the initial fetch, so we can skip the first activation.
  // This check prevents a double-fetch on the first load.
  if (!loading.value) {
    fetchUserProfile(false);
  }
});
</script>

<style scoped>
.info-section {
  padding: 1.5rem 0;
  border-bottom: 1px solid #eee;
}
</style>
