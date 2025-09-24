<template>
  <div class="mb-4 flex flex-wrap items-center justify-between">
    <div class="flex space-x-1 rounded-lg bg-gray-100 p-1">
      <button
        v-for="filter in filters"
        :key="filter.value"
        class="rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200"
        :class="[
          selected === filter.value
            ? 'bg-white text-blue-600 shadow'
            : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700',
        ]"
        @click="$emit('change-filter', filter.value)"
      >
        {{ filter.label }}
      </button>
    </div>

    <button
      class="mt-2 flex items-center rounded-md px-3 py-1 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 sm:mt-0"
      @click="$emit('clear-done')"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="mr-1 h-4 w-4"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
          clip-rule="evenodd"
        />
      </svg>
      刪除已完成
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps({
  selected: {
    type: String,
    required: true,
  },
});

defineEmits(['change-filter', 'clear-done']);

const filters = [
  { label: '全部', value: 'all' },
  { label: '已完成', value: 'done' },
  { label: '未完成', value: 'todo' },
];
</script>
