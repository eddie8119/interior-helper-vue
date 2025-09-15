import { computed, ref, watch } from 'vue';

/**
 * 可編輯標題的共用邏輯
 * @param props 組件屬性，包含標題
 * @param emit 事件發射器
 * @param titlePropName 標題屬性名稱，默認為 'title'
 */
export function useEditableTitle(props: Record<string, any>, emit: any, titlePropName = 'title') {
  const isEditingTitle = ref(false);
  const tempTitle = ref(props[titlePropName] || '');
  const titleInputRef = ref<HTMLInputElement | null>(null);

  // 計算屬性：確保 title 有值
  const title = computed(() => props[titlePropName] || '');

  // 開始編輯模式
  const startEditing = async () => {
    isEditingTitle.value = true;
    tempTitle.value = props[titlePropName] || '';

    // 等待 DOM 更新後聚焦並選中文字
    setTimeout(() => {
      if (titleInputRef.value) {
        titleInputRef.value.focus();
        titleInputRef.value.select();
      }
    }, 0);
  };

  // 輸入框聚焦時選中全部文字
  const onInputFocus = (event: FocusEvent) => {
    const input = event.target as HTMLInputElement;
    input?.select();
  };

  // 儲存標題
  const saveTitle = () => {
    const trimmedTitle = tempTitle.value.trim();

    // 如果標題為空，恢復原標題
    if (!trimmedTitle) {
      tempTitle.value = props[titlePropName];
    }

    isEditingTitle.value = false;

    // 只有當標題真的改變時才發送事件
    if (trimmedTitle && trimmedTitle !== props[titlePropName]) {
      emit(`update:${titlePropName}`, trimmedTitle);
    }
  };

  // 取消編輯
  const cancelEdit = () => {
    tempTitle.value = props[titlePropName];
    isEditingTitle.value = false;
  };

  // 監聽 props 變化
  watch(
    () => props[titlePropName],
    (newTitle: string) => {
      if (!isEditingTitle.value) {
        tempTitle.value = newTitle || '';
      }
    }
  );

  return {
    isEditingTitle,
    tempTitle,
    titleInputRef,
    title,
    startEditing,
    onInputFocus,
    saveTitle,
    cancelEdit,
  };
}
