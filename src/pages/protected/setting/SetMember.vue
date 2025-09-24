<template>
  <div class="flex flex-col gap-4">
    <InviteMember :members="members" />
    <MembersList :members="members" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import InviteMember from '@/components/setting/InviteMember.vue';
import MembersList from '@/components/setting/MembersList.vue';
import { type Member, Role } from '@/types/role';

const members = ref<Member[]>([
  { email: 'owner@example.com', role: Role.OWNER, status: 'joined' },
  { email: 'admin@example.com', role: Role.ADMIN, status: 'joined' },
  { email: 'editor@example.com', role: Role.EDITOR, status: 'pending' },
]);
</script>

<style scoped></style>
