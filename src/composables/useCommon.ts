import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed } from 'vue';

import type { CommonResponse } from '@/types/response';
import type { ConstructionSelection } from '@/types/selection';
import type { CreateCommonSchema } from '@/utils/schemas/createCommonSchema';
import type { UseMutationReturnType } from '@tanstack/vue-query';
import type { ComputedRef, Ref } from 'vue';

import { commonApi } from '@/api/common';

const QUERY_KEY = ['common'];

interface UseCommonReturnType {
  // State from useQuery
  common: Ref<CommonResponse | undefined>;
  isLoading: Ref<boolean>;
  error: Ref<Error | null>;

  // Computed properties
  constructionItemsFromCommon: ComputedRef<ConstructionSelection[]>;
  unitItemsFromCommon: ComputedRef<string[]>;
  projectTypeItemsFromCommon: ComputedRef<string[]>;

  // Mutations from useMutation
  createCommon: UseMutationReturnType<
    CommonResponse,
    Error,
    Partial<CreateCommonSchema>,
    unknown
  >['mutate'];
  isCreating: Ref<boolean>;
  updateCommon: UseMutationReturnType<
    CommonResponse,
    Error,
    { id: string; data: Partial<CreateCommonSchema> },
    unknown
  >['mutate'];
  isUpdating: Ref<boolean>;
  deleteCommon: UseMutationReturnType<void, Error, string, unknown>['mutate'];
  isDeleting: Ref<boolean>;
}

export function useCommon(): UseCommonReturnType {
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
  const constructionItemsFromCommon = computed<ConstructionSelection[]>(() => {
    return common.value?.construction || [];
  });

  const unitItemsFromCommon = computed(() => {
    return common.value?.unit || [];
  });

  const projectTypeItemsFromCommon = computed(() => {
    return common.value?.projectType || [];
  });

  // 新增
  const { mutate: createCommon, isPending: isCreating } = useMutation({
    mutationFn: async (data: Partial<CreateCommonSchema>) => {
      const response = await commonApi.createCommon(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  // 更新
  const { mutate: updateCommon, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateCommonSchema> }) => {
      const response = await commonApi.updateCommon(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  // 刪除
  const { mutate: deleteCommon, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      const response = await commonApi.deleteCommon(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  return {
    // state
    common,
    isLoading,
    error,
    constructionItemsFromCommon,
    unitItemsFromCommon,
    projectTypeItemsFromCommon,

    // mutations
    createCommon,
    isCreating,
    updateCommon,
    isUpdating,
    deleteCommon,
    isDeleting,
  };
}
