<template>
  <div class="mx-auto max-w-6xl p-6">
    <div class="mb-2 flex items-center justify-between gap-4">
      <H1Title :title="t('title.unscheduled_task')" />
      <div class="flex items-center gap-2">
        <TextButton variant="primary" size="md" @click="openInNewTab">
          {{ t('button.open_new_tab') }}
        </TextButton>
        <TextButton variant="ghost" size="md" @click="copyEmail">
          {{ t('button.copy_email') }}
        </TextButton>
        <button
          class="rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 active:scale-95"
          @click="copyEmail"
        >
          {{ t('button.copy_email') }}
        </button>
      </div>
    </div>

    <div class="mt-8 grid gap-4 md:grid-cols-3">
      <div v-for="(panel, pi) in panelList" :key="pi" class="panel-container">
        <div class="text-color-difference font-medium">{{ panel.title }}</div>
        <ul class="mt-2 list-disc pl-5 text-sm text-gray-600">
          <li v-for="(item, ii) in panel.items" :key="ii">
            <template v-if="typeof item === 'string'">
              {{ item }}
            </template>
            <template v-else>
              <template v-if="item.type === 'email'">
                客服信箱：<span class="font-mono">{{ email }}</span>
              </template>
              <template v-else>
                {{ item.content }}
              </template>
            </template>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import TextButton from '@/components/core/button/TextButton.vue';
import H1Title from '@/components/core/title/H1Title.vue';

const { t } = useI18n();

const panelList = [
  {
    title: '建議填寫內容',
    items: ['問題描述與重現步驟', '預期行為與實際結果', '截圖或錄影連結（若有）'],
  },
  {
    title: '處理時程',
    items: ['一般回覆時間：1–2 個工作天', '重大影響問題：優先處理'],
  },
  {
    title: '其他聯絡方式',
    items: [{ type: 'email' }, '或使用頁面右上角的「新分頁開啟」'],
  },
];

const email = 'funsugar8119@gmail.com';
const gmailUrl =
  'https://mail.google.com/mail/?view=cm&fs=1&to=' +
  encodeURIComponent(email) +
  '&body=' +
  encodeURIComponent('詢問: ');

const iframeLoaded = ref(false);
const showAssist = ref(false);
let assistTimer: number | undefined;

const openInNewTab = () => {
  window.open(gmailUrl, '_blank');
};

const copyEmail = async () => {
  await navigator.clipboard.writeText(email);
};

onMounted(() => {
  assistTimer = window.setTimeout(() => {
    if (!iframeLoaded.value) showAssist.value = true;
  }, 2500);
});

onBeforeUnmount(() => {
  if (assistTimer) window.clearTimeout(assistTimer);
});
</script>

<style scoped></style>
