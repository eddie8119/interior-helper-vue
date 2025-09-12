/**
 * 用於獲取。
 *
 * @returns {Object}
 */

import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { DeviceWithAlarms, DeviceWithStatus } from '@/types/label';

import { projectApi } from '@/api/project';
import { formatRelativeTime } from '@/utils/dateTime';

interface UseProjectsReturn {
  isLoadingProjects: Ref<boolean>;
  fetchedProjects: Ref<Project[]>;
  refetchProjects: () => Promise<void>;
  projectsUpdatedAt: Ref<number>;
}

export function useProjects(): UseProjectsReturn {

  const {
    data: fetchedProjects,
    isLoading: isLoadingProjects,
    refetch: refetchQueryProjects,
    dataUpdatedAt: projectsUpdatedAt,
  } = useQuery<Project[], Error, Project[], ['projects']>({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectApi.getProjects();
      return response.data;
    },
    refetchInterval: 1000 * 10,
    staleTime: 1000 * 10, // 10 秒內認為數據是新鮮的
    gcTime: 1000 * 60 * 5, // 5 分鐘後清除緩存
  });

  const refetchProjects = async (): Promise<void> => {
    await refetchQueryProjects();
  };


  return {
    isLoadingProjects,
    fetchedProjects: fetchedProjects as Ref<Project[]>,
    refetchProjects,
    projectsUpdatedAt,
    alarmRecordsUpdatedAt,
    labelsUpdatedAt,
  };
}
