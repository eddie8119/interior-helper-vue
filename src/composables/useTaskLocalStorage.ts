import { ref } from 'vue';

import type { TaskResponse } from '@/types/response';
import type { Ref } from 'vue';

import { getTaskStorageKey, saveTaskToLocalStorage } from '@/utils/storage/taskStorage';

export function useTaskLocalStorage(projectId: string, fetchedTasks: Ref<TaskResponse[] | null>) {
  const localTasks = ref<TaskResponse[] | null>(null);
  const hasChanges = ref(false);
  const storageTasksKey = getTaskStorageKey(projectId);

  // 初始化本地任務數據
  function initLocalTasks() {
    // 類型守衛函數，確保 key 是 TaskResponse 的有效屬性
    function isKeyOfTaskResponse(key: string, obj: TaskResponse): key is keyof TaskResponse {
      return key in obj;
    }

    if (!fetchedTasks.value) return;

    try {
      // 從 localStorage 獲取數據
      const storedData = localStorage.getItem(storageTasksKey);
      let shouldUseLocalData = false;

      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData) as TaskResponse[];

          // 檢查版本是否一致 - 對於任務列表，我們需要比較每個任務
          // 如果有任何一個任務在資料庫中更新了，就使用資料庫數據
          let useDatabase = false;

          // 創建一個映射以便快速查找
          const parsedTaskMap = new Map<string, TaskResponse>();
          parsedData.forEach((task) => parsedTaskMap.set(task.id, task));

          // 檢查是否有任何資料庫任務比本地更新
          if (
            fetchedTasks.value.some((fetchedTask) => {
              const localTask = parsedTaskMap.get(fetchedTask.id);
              return !localTask || new Date(localTask.updatedAt) < new Date(fetchedTask.updatedAt);
            })
          ) {
            useDatabase = true;
          }

          if (useDatabase) {
            // 資料庫數據更新，使用資料庫數據
            localTasks.value = JSON.parse(JSON.stringify(fetchedTasks.value));
            localStorage.setItem(storageTasksKey, JSON.stringify(localTasks.value));
          } else {
            // 本地數據更新，使用本地數據
            // 但需要合併資料庫中新增的任務
            const fetchedTaskIds = new Set(fetchedTasks.value.map((task) => task.id));
            const missingTasks = parsedData.filter((task) => !fetchedTaskIds.has(task.id));

            // 合併本地和資料庫數據
            localTasks.value = [...fetchedTasks.value, ...missingTasks];
            shouldUseLocalData = true;
          }
        } catch (e) {
          // 解析錯誤，使用資料庫數據
          localTasks.value = JSON.parse(JSON.stringify(fetchedTasks.value));
          localStorage.setItem(storageTasksKey, JSON.stringify(localTasks.value));
        }
      } else {
        // 沒有本地數據，使用資料庫數據
        localTasks.value = JSON.parse(JSON.stringify(fetchedTasks.value));
        localStorage.setItem(storageTasksKey, JSON.stringify(localTasks.value));
      }

      // 如果使用本地數據，確保所有任務都有必要的屬性
      if (shouldUseLocalData && fetchedTasks.value && localTasks.value) {
        localTasks.value = localTasks.value.map((localTask) => {
          // 查找對應的資料庫任務
          const fetchedTask = fetchedTasks.value?.find((ft) => ft.id === localTask.id);

          if (fetchedTask) {
            // 使用 Object.entries 和類型守衛合併缺失的屬性
            Object.entries(fetchedTask).forEach(([key, value]) => {
              if (isKeyOfTaskResponse(key, fetchedTask)) {
                // 特別處理數組類型
                if (key === 'materials' && (!localTask[key] || !localTask[key].length) && value) {
                  localTask[key] = [...value];
                }
                // 處理其他屬性
                else if (!localTask[key] && value !== undefined) {
                  (localTask as Record<keyof TaskResponse, unknown>)[key] = value;
                }
              }
            });
          }

          return localTask;
        });
      }
    } catch (e) {
      console.error('初始化本地專案數據失敗:', e);
      if (fetchedTasks.value) {
        localTasks.value = JSON.parse(JSON.stringify(fetchedTasks.value));
      }
    }
  }

  // 保存到 localStorage
  const saveToLocalStorage = () => {
    if (localTasks.value) {
      const changed = saveTaskToLocalStorage(projectId, localTasks.value);
      if (changed) {
        hasChanges.value = true;
      }
    }
  };

  return {
    localTasks,
    hasChanges,
    initLocalTasks,
    saveToLocalStorage,
  };
}
