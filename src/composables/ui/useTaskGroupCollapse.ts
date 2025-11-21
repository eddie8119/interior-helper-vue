import { computed, ref } from 'vue';

/**
 * 任務分組摺疊管理的 composable
 * 支援兩種模式：
 * 1. 正常模式：所有組預設展開，可單獨摺疊部分組
 * 2. 全部摺疊模式：所有組預設摺疊，可單獨展開部分組
 */
export function useTaskGroupCollapse() {
  // 是否處於「全部摺疊」模式
  const allTaskCollapsed = ref(false);

  // 正常模式下，被摺疊的組（記錄 projectId）
  const collapsedGroups = ref<Record<string, boolean>>({});

  // 全部摺疊模式下，被展開的組（記錄 projectId）
  const expandedGroupsWhenAllTaskCollapsed = ref<Record<string, boolean>>({});

  /**
   * 切換全部任務的摺疊狀態
   */
  const toggleAllTask = (): void => {
    // 切換模式
    allTaskCollapsed.value = !allTaskCollapsed.value;

    if (allTaskCollapsed.value) {
      // 進入「全部摺疊」模式：預設隱藏所有組
      // 清空於此模式下手動展開的組清單
      expandedGroupsWhenAllTaskCollapsed.value = {};
    } else {
      // 離開「全部摺疊」模式：預設顯示所有組
      // 清空於正常模式下手動摺疊的組清單
      collapsedGroups.value = {};
    }
  };

  /**
   * 切換單一任務組的摺疊狀態
   * @param projectId - 專案ID
   */
  const toggleTaskGroup = (projectId: string): void => {
    if (allTaskCollapsed.value) {
      // 在「全部摺疊」模式下，切換該組的展開狀態
      expandedGroupsWhenAllTaskCollapsed.value[projectId] =
        !expandedGroupsWhenAllTaskCollapsed.value[projectId];
    } else {
      // 在正常模式下，切換該組的摺疊狀態
      collapsedGroups.value[projectId] = !collapsedGroups.value[projectId];
    }
  };

  /**
   * 判斷任務組是否可見
   * @param projectId - 專案ID
   * @returns 是否可見
   */
  const isGroupTaskVisible = (projectId: string): boolean => {
    if (allTaskCollapsed.value) {
      // 在「全部摺疊」模式下，只有被手動展開的組才可見
      return !!expandedGroupsWhenAllTaskCollapsed.value[projectId];
    }
    // 在正常模式下，僅被手動摺疊的組不可見
    return !collapsedGroups.value[projectId];
  };

  /**
   * 重設所有摺疊狀態
   */
  const resetCollapseState = (): void => {
    allTaskCollapsed.value = false;
    collapsedGroups.value = {};
    expandedGroupsWhenAllTaskCollapsed.value = {};
  };

  return {
    allTaskCollapsed: computed(() => allTaskCollapsed.value),
    toggleAllTask,
    toggleTaskGroup,
    isGroupTaskVisible,
    resetCollapseState,
  };
}
