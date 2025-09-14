import { ref } from 'vue';
import { saveProjectToLocalStorage, getProjectStorageKey } from '@/utils/projectStorage';
import type { Ref } from 'vue';

export function useProjectLocalStorage(projectId: string, fetchedProject: Ref<any>) {
  const localProject = ref<any>(null);
  const hasChanges = ref(false);
  const storageKey = getProjectStorageKey(projectId);

  // 初始化本地專案數據
  function initLocalProject() {
    if (!fetchedProject.value) return;

    try {
      // 從 localStorage 獲取數據
      const storedData = localStorage.getItem(storageKey);
      let shouldUseLocalData = false;

      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          // 檢查版本是否一致
          if (new Date(parsedData.updatedAt) < new Date(fetchedProject.value.updatedAt)) {
            // 資料庫數據更新，使用資料庫數據
            localProject.value = JSON.parse(JSON.stringify(fetchedProject.value));
            localStorage.setItem(storageKey, JSON.stringify(localProject.value));
          } else {
            // 本地數據更新，使用本地數據
            localProject.value = parsedData;
            shouldUseLocalData = true;
          }
        } catch (e) {
          // 解析錯誤，使用資料庫數據
          localProject.value = JSON.parse(JSON.stringify(fetchedProject.value));
          localStorage.setItem(storageKey, JSON.stringify(localProject.value));
        }
      } else {
        // 沒有本地數據，使用資料庫數據
        localProject.value = JSON.parse(JSON.stringify(fetchedProject.value));
        localStorage.setItem(storageKey, JSON.stringify(localProject.value));
      }

      // 確保 constructionContainer 存在
      if (!localProject.value.constructionContainer) {
        localProject.value.constructionContainer = [];
      }

      // 如果使用本地數據，確保所有必要屬性存在
      if (shouldUseLocalData && fetchedProject.value) {
        // 確保本地數據包含資料庫數據的所有必要屬性
        for (const key in fetchedProject.value) {
          if (!(key in localProject.value)) {
            localProject.value[key] = fetchedProject.value[key];
          }
        }
      }
    } catch (e) {
      console.error('初始化本地專案數據失敗:', e);
      if (fetchedProject.value) {
        localProject.value = JSON.parse(JSON.stringify(fetchedProject.value));
      }
    }
  }

  // 保存到 localStorage
  const saveToLocalStorage = () => {
    if (localProject.value) {
      const changed = saveProjectToLocalStorage(projectId, localProject.value);
      if (changed) {
        hasChanges.value = true;
      }
    }
  };

  return {
    localProject,
    hasChanges,
    initLocalProject,
    saveToLocalStorage,
  };
}
