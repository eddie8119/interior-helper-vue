// import { onBeforeUnmount, onMounted } from 'vue';
// import { onBeforeRouteLeave } from 'vue-router';
// import type { Ref } from 'vue';

// import { useTasks } from '@/composables/useTasks';
// import type { ProjectResponse, TaskResponse } from '@/types/response';
// import type { CreateProjectSchema } from '@/utils/schemas/createProjectSchema';

// /**
//  * @composable useProjectDataSaver
//  *
//  * @description
//  * 這個 composable 封裝了專案和任務數據的自動保存邏輯。
//  * 它處理以下情況下的數據保存：
//  * 1. 定期自動保存（每 5 分鐘）。
//  * 2. 在路由離開頁面前保存。
//  * 3. 在頁面卸載（例如關閉、刷新）前保存。
//  *
//  * @param {string} projectId - 當前專案的 ID。
//  * @param {Ref<ProjectResponse | null>} localProject - 本地專案數據的響應式引用。
//  * @param {Ref<boolean>} hasProjectChanges - 指示專案數據是否有變更的響應式引用。
//  * @param {Ref<TaskResponse[] | null>} localTasks - 本地任務數據的響應式引用。
//  * @param {Ref<boolean>} hasTasksChanges - 指示任務數據是否有變更的響應式引用。
//  */
// export function useProjectDataSaver(
//   projectId: string,
//   localProject: Ref<ProjectResponse | null>,
//   hasProjectChanges: Ref<boolean>,
//   localTasks: Ref<TaskResponse[] | null>,
//   hasTasksChanges: Ref<boolean>
// ) {
//   const { updateProject } = useProjects();
//   const { updateProjectTasks } = useTasks(projectId);

//   let autoSaveInterval: number | null = null;

//   const saveData = async () => {
//     if (hasProjectChanges.value && localProject.value) {
//       await updateProject(localProject.value as Partial<CreateProjectSchema>);
//       hasProjectChanges.value = false;
//     }
//     if (hasTasksChanges.value && localTasks.value) {
//       await updateProjectTasks(localTasks.value);
//       hasTasksChanges.value = false;
//     }
//   };

//   // 處理窗口關閉事件
//   const handleBeforeUnload = (event: BeforeUnloadEvent): void => {
//     if (hasProjectChanges.value && localProject.value) {
//       try {
//         // 使用 sendBeacon 進行非同步請求
//         const url = `/api/projects/${projectId}`;
//         const data = JSON.stringify(localProject.value);
//         navigator.sendBeacon(url, data);
//       } catch (error) {
//         console.error('窗口關閉或刷新時保存數據失敗:', error);
//       }
//     }
//     // 注意：任務數據的 sendBeacon 邏輯較複雜，暫時依賴其他保存機制
//   };

//   onMounted(() => {
//     // 設置定期保存
//     autoSaveInterval = window.setInterval(saveData, 5 * 60 * 1000); // 5 分鐘
//     window.addEventListener('beforeunload', handleBeforeUnload);
//   });

//   onBeforeUnmount(async () => {
//     await saveData();
//     window.removeEventListener('beforeunload', handleBeforeUnload);
//     if (autoSaveInterval) {
//       clearInterval(autoSaveInterval);
//     }
//   });

//   onBeforeRouteLeave(async (_, __, next) => {
//     await saveData();
//     next();
//   });
// }
