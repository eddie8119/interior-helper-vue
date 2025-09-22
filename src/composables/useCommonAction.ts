import { ref, watch } from 'vue';

import { useCommon } from './useCommon';

export function useCommonAction() {
  const { common, constructionItems, updateCommon } = useCommon();
  const newConstructionItem = ref<string>('');
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

  // 針對construction更新
  const addConstructionData = async () => {
    const item = newConstructionItem.value.trim();
    if (!item || localConstructionItems.value.includes(item)) return false;

    const updatedConstructions = [...localConstructionItems.value, item];
    await updateCommonData('construction', { construction: updatedConstructions });
    newConstructionItem.value = '';
  };

  const updateConstructionData = async (updatedConstructions: string[]) => {
    await updateCommonData('construction', { construction: updatedConstructions });
  };

  const updateCommonData = async (type: 'construction' | 'unit' | 'all', updateData: any) => {
    switch (type) {
      // 針對construction更新
      case 'construction':
        try {
          if (common.value && common.value.length > 0) {
            const commonItem = common.value[0];

            await updateCommon({
              id: commonItem.id,
              data: {
                construction: updateData.construction,
                unit: commonItem.unit,
              },
            });

            localConstructionItems.value = updateData.construction;

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
    addConstructionData,
    updateConstructionData,
  };
}
