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

    <ElSkeleton :loading="isLoadingProfile" animated>
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
import { onActivated, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import EditInput from '@/components/core/input/EditInput.vue';
import H1Title from '@/components/core/title/H1Title.vue';
import { useUser } from '@/composables/useUser';

const { t } = useI18n();
const { userProfile, isLoadingProfile, refetchProfile, updateProfile, isUpdatingProfile } =
  useUser();

const email = ref<string>('');
const username = ref<string>('');

// Sync local fields when userProfile changes
watch(
  () => userProfile?.value,
  (profile: any) => {
    if (!profile) return;
    const user = profile.user ?? profile;
    email.value = user?.email ?? '';
    username.value = user?.username ?? user?.name ?? '';
  },
  { immediate: true }
);

const handleSaveUsername = async (data: string) => {
  try {
    const { success, message } = await updateProfile({ name: data });
    if (success) {
      ElMessage.success(t('message.success.updateProfile'));
    } else {
      ElMessage.error(message || t('message.error.updateProfile'));
      throw new Error(message || 'Failed to update profile');
    }
  } catch (err) {
    console.error('Failed to update username:', err);
    ElMessage.error(t('message.error.updateProfile') || 'Failed to update profile');
    throw err;
  }
};

// onActivated is called when a kept-alive component is re-inserted into the DOM.
// We refresh the data in the background without showing the loader.
onActivated(() => {
  // The onMounted hook handles the initial fetch, so we can skip the first activation.
  // This check prevents a double-fetch on the first load.
  if (!isLoadingProfile.value) {
    refetchProfile();
  }
});
</script>

<style scoped>
.info-section {
  padding: 1.5rem 0;
}
</style>
