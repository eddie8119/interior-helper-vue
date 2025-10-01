import { defineStore } from 'pinia';
import { ref } from 'vue';

export type EditingComponentType = 'container' | 'task' | 'none';

export interface EditingState {
  type: EditingComponentType;
  id: string | null;
}

/**
 * Store to manage editing states across components
 * Ensures only one component can be in editing mode at a time
 */
export const useEditingStateStore = defineStore('editingState', () => {
  // Current editing state
  const currentEditingState = ref<EditingState>({
    type: 'none',
    id: null,
  });

  /**
   * Start editing a component
   * @param type Type of component being edited ('container' or 'task')
   * @param id ID of the component (can be container ID or task ID)
   * @returns boolean indicating if editing was successfully started
   */
  function startEditing(type: EditingComponentType, id: string): boolean {
    // If already editing this component, do nothing
    if (currentEditingState.value.type === type && currentEditingState.value.id === id) {
      return true;
    }

    // Clear any existing editing state
    currentEditingState.value = {
      type,
      id,
    };

    return true;
  }

  /**
   * Stop editing the current component
   */
  function stopEditing(): void {
    currentEditingState.value = {
      type: 'none',
      id: null,
    };
  }

  /**
   * Check if a specific component is currently being edited
   * @param type Type of component to check
   * @param id ID of the component to check
   * @returns boolean indicating if the component is being edited
   */
  function isEditing(type: EditingComponentType, id: string | number): boolean {
    return currentEditingState.value.type === type && currentEditingState.value.id === id;
  }

  /**
   * Check if any component is currently being edited
   * @returns boolean indicating if any component is being edited
   */
  function isAnyEditing(): boolean {
    return currentEditingState.value.type !== 'none';
  }

  return {
    currentEditingState,
    startEditing,
    stopEditing,
    isEditing,
    isAnyEditing,
  };
});
