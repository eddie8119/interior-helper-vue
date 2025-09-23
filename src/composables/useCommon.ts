import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed } from 'vue';

import type { CreateCommonSchema } from '@/utils/schemas/createCommonSchema';

import { commonApi } from '@/api/common';

const QUERY_KEY = ['common'];

export function useCommon() {
  const queryClient = useQueryClient();

  // 查詢
  const {
    data: common,
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await commonApi.getCommon();
      return res.data;
    },
  });

  // 分離 construction 和 unit
  const constructionItems = computed<string[]>(() => {
    if (!common.value || !common.value.length) return [];

    // Get all construction arrays and flatten them
    const allConstructions = common.value.flatMap((common) => common.construction || []);
    // Remove duplicates and return as array
    return [...new Set(allConstructions)];
  });

  const unitItems = computed(() => {
    if (!common.value) return [];
    return [...new Set(common.value.flatMap((common) => common.unit || []))];
  });

  const projectTypeItems = computed(() => {
    if (!common.value) return [];
    return [...new Set(common.value.flatMap((common) => common.projectType || []))];
  });

  // 新增
  const { mutate: createCommon, isPending: isCreating } = useMutation({
    mutationFn: (data: Partial<CreateCommonSchema>) => commonApi.createCommon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  // 更新
  const { mutate: updateCommon, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCommonSchema> }) =>
      commonApi.updateCommon(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  // 刪除
  const { mutate: deleteCommon, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => commonApi.deleteCommon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  return {
    // state
    common,
    isLoading,
    error,
    constructionItems,
    unitItems,
    projectTypeItems,

    // mutations
    createCommon,
    isCreating,
    updateCommon,
    isUpdating,
    deleteCommon,
    isDeleting,
  };
}
