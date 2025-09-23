import { ref, watch } from 'vue';

import { useCommon } from './useCommon';

export function useCommonAction() {
  const { common, constructionItems, updateCommon, unitItems, projectTypeItems } = useCommon();
  // construction
  const newConstructionItem = ref<string>('');
  const localConstructionItems = ref<string[]>([]);
  // unit
  const newUnitItem = ref<string>('');
  const localUnitItems = ref<string[]>([]);
  // projectType
  const newProjectTypeItem = ref<string>('');
  const localProjectTypeItems = ref<string[]>([]);

  // Initialize local construction items
  watch(
    () => [constructionItems.value, unitItems.value, projectTypeItems.value],
    ([constructionItems, unitItems, projectTypeItems]) => {
      if (constructionItems) {
        localConstructionItems.value = [...constructionItems];
      }
      if (unitItems) {
        localUnitItems.value = [...unitItems];
      }
      if (projectTypeItems) {
        localProjectTypeItems.value = [...projectTypeItems];
      }
    },
    { immediate: true }
  );

  // 針對construction更新
  const addConstructionData = async () => {
    const item = newConstructionItem.value.trim();
    if (!item || localConstructionItems.value.includes(item)) return false;

    const updatedConstructions = [...localConstructionItems.value, item];
    await updateCommonData({
      construction: updatedConstructions,
      unit: localUnitItems.value,
      projectType: localProjectTypeItems.value,
    });
    newConstructionItem.value = '';
  };

  const updateConstructionData = async (updatedConstructions: string[]) => {
    await updateCommonData({
      construction: updatedConstructions,
      unit: localUnitItems.value,
      projectType: localProjectTypeItems.value,
    });
  };

  // 針對unit更新
  const addUnitData = async () => {
    const item = newUnitItem.value.trim();
    if (!item || localUnitItems.value.includes(item)) return false;

    const updatedUnits = [...localUnitItems.value, item];
    await updateCommonData({
      construction: localConstructionItems.value,
      unit: updatedUnits,
      projectType: localProjectTypeItems.value,
    });
    newUnitItem.value = '';
  };

  const updateUnitData = async (updatedUnits: string[]) => {
    await updateCommonData({
      construction: localConstructionItems.value,
      unit: updatedUnits,
      projectType: localProjectTypeItems.value,
    });
  };

  // 針對projectType更新
  const addProjectTypeData = async () => {
    const item = newProjectTypeItem.value.trim();
    if (!item || localProjectTypeItems.value.includes(item)) return false;

    const updatedProjectTypes = [...localProjectTypeItems.value, item];
    await updateCommonData({
      construction: localConstructionItems.value,
      unit: localUnitItems.value,
      projectType: updatedProjectTypes,
    });
    newProjectTypeItem.value = '';
  };

  const updateProjectTypeData = async (updatedProjectTypes: string[]) => {
    await updateCommonData({
      construction: localConstructionItems.value,
      unit: localUnitItems.value,
      projectType: updatedProjectTypes,
    });
  };

  const updateCommonData = async (updateData: {
    construction: string[];
    unit: string[];
    projectType: string[];
  }) => {
    try {
      if (common.value && common.value.length > 0) {
        const commonItem = common.value[0];

        await updateCommon({
          id: commonItem.id,
          data: {
            construction: updateData.construction,
            unit: updateData.unit,
          },
        });

        localConstructionItems.value = updateData.construction;

        return true;
      }
    } catch (error) {
      console.error('Failed to update construction items:', error);
      return false;
    }
  };

  return {
    updateCommonData,
    // construction
    newConstructionItem,
    localConstructionItems,
    addConstructionData,
    updateConstructionData,
    // unit
    newUnitItem,
    localUnitItems,
    addUnitData,
    updateUnitData,
    // projectType
    newProjectTypeItem,
    localProjectTypeItems,
    addProjectTypeData,
    updateProjectTypeData,
  };
}
