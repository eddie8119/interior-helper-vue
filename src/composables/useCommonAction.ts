import { ref, watch } from 'vue';

import { useCommon } from './useCommon';

export function useCommonAction() {
  const { common, constructionItems, updateCommon } = useCommon();
  const newConstructionItem = ref('');
  const localConstructionItems = ref<string[]>([]);

  // Initialize local construction items
  watch(
    () => constructionItems.value,
    (items: string[]) => {
      if (items) {
        localConstructionItems.value = [...items];
      }
    },
    { immediate: true }
  );

  const updateCommonData = async (type: 'construction' | 'unit' | 'all') => {
    switch (type) {
      // 針對construction更新
      case 'construction':
        const item = newConstructionItem.value.trim();
        if (!item || localConstructionItems.value.includes(item)) return false;

        try {
          const updatedConstructions = [...localConstructionItems.value, item];

          if (common.value && common.value.length > 0) {
            const commonItem = common.value[0];

            await updateCommon({
              id: commonItem.id,
              data: {
                construction: updatedConstructions,
                unit: commonItem.unit,
              },
            });

            localConstructionItems.value = updatedConstructions;
            newConstructionItem.value = '';
            return true;
          }
        } catch (error) {
          console.error('Failed to update construction items:', error);
          return false;
        }
        break;
      case 'unit':
        // Handle unit updates if needed
        break;
      default:
        break;
    }
    return false;
  };

  return {
    newConstructionItem,
    localConstructionItems,
    updateCommonData,
  };
}
