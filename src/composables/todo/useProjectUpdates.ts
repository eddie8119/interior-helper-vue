import type { ProjectResponse } from '@/types/response';
import type { ConstructionSelection } from '@/types/selection';
import type { Ref } from 'vue';

export function useProjectUpdates(
  project: Ref<ProjectResponse | null>,
  saveProjectToLocalStorage: () => void,
  updateLastUpdateTime: () => void
) {
  // 更新專案標題的方法
  const updateProjectTitle = (newTitle: string) => {
    if (project.value) {
      // 只更新標題屬性，不影響其他屬性
      project.value = {
        ...project.value,
        title: newTitle,
      };
      saveProjectToLocalStorage();
      updateLastUpdateTime();
    }
  };

  // 更新工程容器的方法
  const updateConstructionContainer = (containers: ConstructionSelection[]) => {
    if (project.value) {
      // 只更新工程容器屬性，不影響其他屬性
      project.value = {
        ...project.value,
        constructionContainer: containers,
      };
      saveProjectToLocalStorage();
      updateLastUpdateTime();
    }
  };

  return {
    updateProjectTitle,
    updateConstructionContainer,
  };
}
