import { ref, shallowRef } from 'vue';

import type { TaskResponse } from '@/types/response';
import type { Ref } from 'vue';

import { getTaskStorageKey, saveTaskToLocalStorage } from '@/utils/storage/taskStorage';

/**
 * @composable useTaskLocalStorage
 *
 * @description
 * 這個 composable 用於管理任務數據在 localStorage 中的本地存儲和同步。
 * 它的主要功能是：
 * 1. 在本地 localStorage 中緩存從伺服器獲取的任務數據。
 * 2. 比較本地數據和伺服器數據的版本（通過 `updatedAt` 時間戳），以決定使用哪個版本。
 * 3. 提供初始化 (`initLocalTasks`) 和保存 (`saveToLocalStorage`) 的方法。
 * 4. 追蹤本地數據是否有變更 (`hasChanges`)。
 *
 * @param {string} projectId - 當前專案的 ID，用於生成 localStorage 的 key。
 * @param {Ref<TaskResponse[] | null>} fetchedTasks - 從伺服器獲取並傳入的任務數據的響應式引用。
 *
 * @returns {{
 *   localTasks: Ref<TaskResponse[] | null>,
 *   hasChanges: Ref<boolean>,
 *   initLocalTasks: () => void,
 *   saveToLocalStorage: () => void
 * }}
 */
export function useTaskLocalStorage(projectId: string, fetchedTasks: Ref<TaskResponse[] | null>) {
  const localTasks = shallowRef<TaskResponse[] | null>(null);
  const hasChanges = ref(false);
  const storageTasksKey = getTaskStorageKey(projectId);

  /**
   * @function initLocalTasks
   * @description 初始化本地任務數據。
   * 該函數會檢查 localStorage 中是否有已存儲的數據。
   * - 如果有，它會比較本地數據和伺服器數據的 `updatedAt` 時間戳。
   *   - 如果伺服器數據較新，則使用伺服器數據並更新 localStorage。
   *   - 如果本地數據較新或時間戳相同，則使用本地數據。
   * - 如果沒有本地數據，則直接使用伺服器數據並存入 localStorage。
   */
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

          // 進行更精確的合併邏輯
          const mergedTasks = new Map<string, TaskResponse>();

          // 1. 先將所有本地任務放入 Map
          parsedData.forEach((task) => {
            if (task && task.id) {
              mergedTasks.set(task.id, task);
            }
          });

          // 2. 遍歷伺服器任務，進行比較和合併
          fetchedTasks.value.forEach((fetchedTask) => {
            if (fetchedTask && fetchedTask.id) {
              const localTask = mergedTasks.get(fetchedTask.id);
              // 如果本地不存在，或伺服器版本較新，則使用伺服器版本
              if (
                !localTask ||
                (localTask.updatedAt &&
                  fetchedTask.updatedAt &&
                  new Date(localTask.updatedAt) < new Date(fetchedTask.updatedAt))
              ) {
                mergedTasks.set(fetchedTask.id, fetchedTask);
              }
              // 否則，保留本地較新的版本（已在 Map 中）
            }
          });

          localTasks.value = Array.from(mergedTasks.values());
          shouldUseLocalData = true;

          // 重要修復：確保合併後的數據始終保存回 localStorage
          localStorage.setItem(storageTasksKey, JSON.stringify(localTasks.value));
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
                // 特別處理 materials：即使本地已有陣列，也要把缺少的欄位（如 unit）補齊
                if (key === 'materials' && Array.isArray(value)) {
                  const localMaterials = localTask.materials;
                  const fetchedMaterials = value as NonNullable<TaskResponse['materials']>;

                  if (!localMaterials || !Array.isArray(localMaterials) || !localMaterials.length) {
                    localTask.materials = [...fetchedMaterials];
                  } else if (fetchedMaterials && fetchedMaterials.length > 0) {
                    // 使用名稱來匹配材料（因為 materials 沒有 id 欄位）
                    const localByName = new Map<
                      string,
                      NonNullable<TaskResponse['materials']>[number]
                    >();
                    for (const m of localMaterials) {
                      if (m && typeof m === 'object' && m.name) {
                        localByName.set(m.name, m);
                      }
                    }

                    for (const f of fetchedMaterials) {
                      if (f && typeof f === 'object' && f.name) {
                        const target = localByName.get(f.name);
                        if (target) {
                          // 將缺少或為 null 的屬性（如 unit）從伺服器補到本地
                          Object.keys(f).forEach((k) => {
                            const key = k as keyof typeof f;
                            if (target[key] === undefined || target[key] === null) {
                              (target as Record<string, unknown>)[key] = f[key];
                            }
                          });
                        } else {
                          // 本地沒有這筆材料，直接加入
                          localTask.materials?.push({ ...f });
                        }
                      }
                    }
                  }
                }
                // 處理其他屬性：若本地缺少就補齊
                else if (
                  (localTask[key] === undefined || localTask[key] === null) &&
                  value !== undefined
                ) {
                  (localTask as Record<keyof TaskResponse, unknown>)[key] = value;
                }
              }
            });
          }

          return localTask;
        });
      }
    } catch (e) {
      console.error('初始化本地任務數據失敗:', e);
      if (fetchedTasks.value) {
        localTasks.value = JSON.parse(JSON.stringify(fetchedTasks.value));
      }
    }
  }

  /**
   * @function saveToLocalStorage
   * @description 將當前的 `localTasks` 狀態保存到 localStorage。
   * 如果數據發生了實際變更，它會將 `hasChanges` 標記設置為 true。
   */
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
