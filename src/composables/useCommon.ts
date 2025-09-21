import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed } from 'vue';

import { commonApi } from '@/api/common';
import type { CreateCommonSchema } from '@/utils/schemas/createCommonSchema';

const QUERY_KEY = ['commons'];

export function useCommon() {
  const queryClient = useQueryClient();

  // 查詢
  const {
    data: commons,
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
    if (!commons.value || !commons.value.length) return [];

    // Get all construction arrays and flatten them
    const allConstructions = commons.value.flatMap((common) => common.construction || []);
    // Remove duplicates and return as array
    return [...new Set(allConstructions)];
  });

  const unitItems = computed(() => {
    if (!commons.value) return [];
    return [...new Set(commons.value.flatMap((common) => common.unit || []))];
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
    commons,
    isLoading,
    error,
    constructionItems,
    unitItems,

    // mutations
    createCommon,
    isCreating,
    updateCommon,
    isUpdating,
    deleteCommon,
    isDeleting,
  };
}
