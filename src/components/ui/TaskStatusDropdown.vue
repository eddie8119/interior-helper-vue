<template>
  <el-dropdown trigger="click" @command="handleCommand">
    <button
      class="status-badge flex items-center px-3 py-1.5 transition-all duration-200 hover:shadow-sm"
      :class="statusClass"
    >
      {{ statusText }}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="ml-1.5 h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="todo">
          <div class="flex items-center">
            <div class="mr-3 h-3 w-3 rounded-full bg-gray-400" />
            <span class="text-gray-800">待辦</span>
          </div>
        </el-dropdown-item>
        <el-dropdown-item command="in_progress">
          <div class="flex items-center">
            <div class="mr-3 h-3 w-3 rounded-full bg-blue-400" />
            <span class="text-blue-800">進行中</span>
          </div>
        </el-dropdown-item>
        <el-dropdown-item command="done">
          <div class="flex items-center">
            <div class="mr-3 h-3 w-3 rounded-full bg-green-400" />
            <span class="text-green-800">已完成</span>
          </div>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type Status = 'todo' | 'in_progress' | 'done';

const props = defineProps<{
  status: Status;
}>();

const emit = defineEmits<{ (e: 'update:status', status: Status): void }>();

const handleCommand = (command: Status) => {
  emit('update:status', command);
};

const statusClass = computed(() => {
  switch (props.status) {
    case 'done':
      return 'bg-green-100 text-green-700';
    case 'in_progress':
      return 'bg-blue-100 text-blue-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
});

const statusText = computed(() => {
  switch (props.status) {
    case 'done':
      return '已完成';
    case 'in_progress':
      return '進行中';
    default:
      return '待辦';
  }
});
</script>

<style scoped>
.status-badge {
  font-size: 0.95rem;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
}
</style>
