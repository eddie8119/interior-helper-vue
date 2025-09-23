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

  type DataType = 'construction' | 'unit' | 'projectType';

  // 通用的新增資料方法
  const addData = async (type: DataType) => {
    // 根據類型選擇對應的資料和引用
    const dataMap = {
      construction: {
        newItem: newConstructionItem,
        localItems: localConstructionItems,
      },
      unit: {
        newItem: newUnitItem,
        localItems: localUnitItems,
      },
      projectType: {
        newItem: newProjectTypeItem,
        localItems: localProjectTypeItems,
      },
    };

    const { newItem, localItems } = dataMap[type];
    const item = newItem.value.trim();

    // 驗證
    if (!item || localItems.value.includes(item)) return false;

    // 更新資料
    const updatedItems = [...localItems.value, item];
    await updateData(type, updatedItems);

    // 清空輸入
    newItem.value = '';
    return true;
  };

  // 通用的更新資料方法
  const updateData = async (type: DataType, updatedItems: string[]) => {
    // 準備更新資料
    const updatePayload = {
      construction: type === 'construction' ? updatedItems : localConstructionItems.value,
      unit: type === 'unit' ? updatedItems : localUnitItems.value,
      projectType: type === 'projectType' ? updatedItems : localProjectTypeItems.value,
    };

    // 更新資料
    await updateCommonData(updatePayload);

    // 更新本地狀態
    if (type === 'construction') localConstructionItems.value = updatedItems;
    if (type === 'unit') localUnitItems.value = updatedItems;
    if (type === 'projectType') localProjectTypeItems.value = updatedItems;
  };

  const addConstructionData = () => addData('construction');
  const updateConstructionData = (items: string[]) => updateData('construction', items);

  const addUnitData = () => addData('unit');
  const updateUnitData = (items: string[]) => updateData('unit', items);

  const addProjectTypeData = () => addData('projectType');
  const updateProjectTypeData = (items: string[]) => updateData('projectType', items);

  const updateCommonData = async (updateData: {
    construction: string[];
    unit: string[];
    projectType: string[];
  }) => {
    try {
      if (common.value && common.value.length > 0) {
        await updateCommon({
          id: common.value[0].id,
          data: {
            construction: updateData.construction,
            unit: updateData.unit,
            projectType: updateData.projectType,
          },
        });

        // 更新本地狀態
        localConstructionItems.value = updateData.construction;
        localUnitItems.value = updateData.unit;
        localProjectTypeItems.value = updateData.projectType;

        return true;
      }
    } catch (error) {
      console.error('Failed to update common data:', error);
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
