import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { type Ref } from 'vue';

import type { DraftResponse } from '@/types/response';

import { draftApi } from '@/api/draft';

interface UseDraftReturn {
  isLoading: Ref<boolean>;
  error: Ref<Error | null>;
  draft: Ref<DraftResponse | null>;
  createDraft: (data: Partial<DraftResponse>) => Promise<DraftResponse | undefined>;
  updateDraft: (id: string, data: Partial<DraftResponse>) => Promise<DraftResponse | undefined>;
  deleteDraft: (id: string) => Promise<void>;
}

const QUERY_KEY = ['draft'];

export function useDraft(): UseDraftReturn {
  const queryClient = useQueryClient();

  // 獲取草稿資料
  const {
    data: draft,
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const response = await draftApi.getDraft();
      return response.data;
    },
  });

  // 建立草稿
  const { mutateAsync: createMutate } = useMutation({
    mutationFn: (data: Partial<DraftResponse>) => draftApi.createdraft(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const createDraft = async (data: Partial<DraftResponse>) => {
    try {
      const response = await createMutate(data);
      return response.data;
    } catch (err) {
      console.error('建立草稿失敗:', err);
    }
  };

  // 更新草稿
  const { mutateAsync: updateMutate } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DraftResponse> }) =>
      draftApi.updatedraft(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const updateDraft = async (id: string, data: Partial<DraftResponse>) => {
    try {
      const response = await updateMutate({ id, data });
      return response.data;
    } catch (err) {
      console.error('更新草稿失敗:', err);
    }
  };

  // 刪除草稿
  const { mutateAsync: deleteMutate } = useMutation({
    mutationFn: (id: string) => draftApi.deletedraft(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const deleteDraft = async (id: string) => {
    try {
      await deleteMutate(id);
    } catch (err) {
      console.error('刪除草稿失敗:', err);
    }
  };

  return {
    isLoading,
    error: error as Ref<Error | null>,
    draft: draft as Ref<DraftResponse | null>,
    createDraft,
    updateDraft,
    deleteDraft,
  };
}
