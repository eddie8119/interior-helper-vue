<template>
  <ElCard class="panel-container">
    <template #header>
      <div class="flex items-center">
        <ElAvatar :size="50" class="mr-4">
          {{ userInitial }}
        </ElAvatar>
        <H1Title :title="userName" />
      </div>
    </template>

    <ElSkeleton :loading="isLoadingProfile" animated>
      <template #default>
        <div class="profile-info space-y-6">
          <div class="info-section">
            <ElDescriptions :column="1" border>
              <ElDescriptionsItem :label="t('label.user.name')">
                <EditInput
                  v-model="nameModel"
                  :placeholder="t('placeholder.auth.name')"
                  name="name"
                  type="text"
                  :is-loading="isUpdatingProfile"
                  @save="handleSaveName"
                />
              </ElDescriptionsItem>
              <ElDescriptionsItem :label="t('label.user.email')">
                <div class="flex items-center">
                  <span>{{ userEmail }}</span>
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
import { computed, onActivated } from 'vue';
import { useI18n } from 'vue-i18n';

import EditInput from '@/components/core/input/EditInput.vue';
import H1Title from '@/components/core/title/H1Title.vue';
import { useUser } from '@/composables/useUser';

const { t } = useI18n();
const { userProfile, isLoadingProfile, refetchProfile, updateProfile, isUpdatingProfile } =
  useUser();

const userName = computed(() => userProfile.value?.userDoc?.name ?? '');
const userEmail = computed(() => userProfile.value?.userDoc?.email ?? '');
const userInitial = computed(() => userName.value?.charAt(0)?.toUpperCase() || 'U');

// v-model proxy without local ref
const nameModel = computed({
  get: () => userName.value,
  set: async (val: string) => {
    // reuse your existing save logic
    await updateProfile({ name: val });
  },
});

const handleSaveName = async (data: string) => {
  try {
    const { success, message } = await updateProfile({ name: data });
    if (success) {
      ElMessage.success(t('message.success.updateProfile'));
    } else {
      ElMessage.error(message || t('message.error.updateProfile'));
      throw new Error(message || 'Failed to update profile');
    }
  } catch (err) {
    console.error('Failed to update name:', err);
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
