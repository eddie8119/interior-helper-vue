import { ref } from 'vue';

import type { ProjectResponse } from '@/types/response';
import type { Ref } from 'vue';

import { getProjectStorageKey, saveProjectToLocalStorage } from '@/utils/storage/projectStorage';

export function useProjectLocalStorage(
  projectId: string,
  fetchedProject: Ref<ProjectResponse | null>
) {
  const localProject = ref<ProjectResponse | null>(null);
  const hasChanges = ref(false);
  const storageKey = getProjectStorageKey(projectId);

  // 初始化本地專案數據
  function initLocalProject() {
    // 類型守衛函數，確保 key 是 ProjectResponse 的有效屬性
    function isKeyOfProjectResponse(
      key: string,
      obj: ProjectResponse
    ): key is keyof ProjectResponse {
      return key in obj;
    }

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
      if (localProject.value && !localProject.value.constructionContainer) {
        localProject.value.constructionContainer = [];
      }

      // 如果使用本地數據，確保所有必要屬性存在

      if (shouldUseLocalData && fetchedProject.value && localProject.value) {
        // 確保本地數據包含資料庫數據的所有必要屬性
        // 使用安全的方式合併缺失的屬性
        const local = localProject.value as ProjectResponse;
        const fetched = fetchedProject.value as ProjectResponse;

        // 使用 Object.entries 和類型守衛合併缺失的屬性
        Object.entries(fetched).forEach(([key, value]) => {
          // 類型守衛，確保 key 是 ProjectResponse 的有效屬性
          if (isKeyOfProjectResponse(key, fetched)) {
            // 特別處理數組類型
            if (key === 'constructionContainer' && !local[key] && value) {
              local[key] = [...value];
            }
            // 處理其他屬性
            else if (!local[key] && value) {
              local[key] = value;
            }
          }
        });
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
