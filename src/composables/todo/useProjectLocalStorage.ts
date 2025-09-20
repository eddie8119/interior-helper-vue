import { ref } from 'vue';

import type { ProjectResponse } from '@/types/response';
import type { Ref } from 'vue';

import { getProjectStorageKey, saveProjectToLocalStorage } from '@/utils/storage/projectStorage';

/**
 * @composable useProjectLocalStorage
 *
 * @description
 * 這個 composable 用於管理專案數據在 localStorage 中的本地存儲和同步。
 * 它的主要功能是：
 * 1. 在本地 localStorage 中緩存從伺服器獲取的專案數據。
 * 2. 比較本地數據和伺服器數據的版本（通過 `updatedAt` 時間戳），以決定使用哪個版本。
 * 3. 提供初始化 (`initLocalProject`) 和保存 (`saveToLocalStorage`) 的方法。
 * 4. 追蹤本地數據是否有變更 (`hasChanges`)。
 * 5. 確保本地數據結構與伺服器數據結構同步，避免因數據模型更新導致的錯誤。
 *
 * @param {string} projectId - 當前專案的 ID，用於生成 localStorage 的 key。
 * @param {Ref<ProjectResponse | null>} fetchedProject - 從伺服器獲取並傳入的專案數據的響應式引用。
 *
 * @returns {{
 *   localProject: Ref<ProjectResponse | null>,
 *   hasChanges: Ref<boolean>,
 *   initLocalProject: () => void,
 *   saveToLocalStorage: () => void
 * }}
 * - `localProject`: 響應式引用，存儲最終合併後的專案數據，供 UI 使用。
 * - `hasChanges`: 一個布林值的響應式引用，表示本地數據是否已變更且尚未保存到 API。
 * - `initLocalProject`: 一個函數，用於從 localStorage 或傳入的 `fetchedProject` 初始化 `localProject`。
 * - `saveToLocalStorage`: 一個函數，用於將當前的 `localProject` 狀態保存到 localStorage。
 */
export function useProjectLocalStorage(
  projectId: string,
  fetchedProject: Ref<ProjectResponse | null>
) {
  const localProject = ref<ProjectResponse | null>(null);
  const hasChanges = ref(false);
  const storageKey = getProjectStorageKey(projectId);

  /**
   * @function initLocalProject
   * @description 初始化本地專案數據。
   * 該函數會檢查 localStorage 中是否有已存儲的數據。
   * - 如果有，它會比較本地數據和伺服器數據的 `updatedAt` 時間戳。
   *   - 如果伺服器數據較新，則使用伺服器數據並更新 localStorage。
   *   - 如果本地數據較新或時間戳相同，則使用本地數據。
   * - 如果沒有本地數據，則直接使用伺服器數據並存入 localStorage。
   * - 此外，它還會確保數據結構的完整性，例如 `constructionContainer` 屬性的存在，並合併伺服器端新增的屬性。
   */
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

  /**
   * @function saveToLocalStorage
   * @description 將當前的 `localProject` 狀態保存到 localStorage。
   * 如果數據發生了實際變更，它會將 `hasChanges` 標記設置為 true。
   */
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
