<template>
  <ElCard class="panel-container">
    <template #header>
      <div class="flex items-center">
        <ElAvatar :size="50" class="mr-4">
          {{ username?.charAt(0)?.toUpperCase() || 'U' }}
        </ElAvatar>
        <H1Title :title="username" />
      </div>
    </template>

    <ElSkeleton :loading="loading" animated>
      <template #default>
        <div class="profile-info space-y-6">
          <div class="info-section">
            <ElDescriptions :column="1" border>
              <ElDescriptionsItem :label="t('label.user.username')">
                <EditInput
                  v-model="username"
                  :placeholder="t('placeholder.username')"
                  name="username"
                  type="text"
                  :is-loading="isUpdatingProfile"
                  @save="handleSaveUsername"
                />
              </ElDescriptionsItem>
              <ElDescriptionsItem :label="t('label.user.email')">
                <div class="flex items-center">
                  <span>{{ email }}</span>
                </div>
              </ElDescriptionsItem>
            </ElDescriptions>
          </div>
        </div>
      </template>
    </ElSkeleton>
  </ElCard>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { onActivated, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { userApi } from '@/api/user';
import EditInput from '@/components/core/input/EditInput.vue';
import H1Title from '@/components/core/title/H1Title.vue';
import { useUser } from '@/composables/useUser';

const { t } = useI18n();
const { updateProfile, isUpdatingProfile } = useUser();

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

const handleSaveUsername = async (newUsername: string) => {
  try {
    const result = await updateProfile({ name: newUsername });
    if (result.success) {
      ElMessage.success(t('message.success.updateProfile') || 'Profile updated successfully');
    } else {
      ElMessage.error(
        result.message || t('message.error.updateProfile') || 'Failed to update profile'
      );
      throw new Error(result.message || 'Failed to update profile');
    }
  } catch (err) {
    console.error('Failed to update username:', err);
    ElMessage.error(t('message.error.updateProfile') || 'Failed to update profile');
    throw err;
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
}
</style>
