<template>
  <div v-if="materials && materials.length > 0" class="text-color-difference mt-1">
    <ul class="space-y-1">
      <li v-for="material in materials" :key="material.id" class="flex items-center gap-1 text-sm">
        <span>•</span>
        <span class="font-medium">{{ material.name }}:</span>
        <span> {{ material.quantity }} {{ material.unit }} × ${{ material.unitPrice }} </span>
        <span>=</span>
        <span class="font-semibold">${{ calculatePrice(material) }}</span>
      </li>
    </ul>
    <div class="mt-2 flex justify-end text-sm">
      <span>{{ t('label.total') }}: ${{ calculateTotal() }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

interface Material {
  id?: string;
  name: string;
  quantity?: number;
  unitPrice?: number;
  unit?: string;
  taskId?: string;
  userId?: string;
  createdAt?: string;
}

const props = withDefaults(
  defineProps<{
    materials: Material[];
    showTotal?: boolean;
  }>(),
  {
    showTotal: false,
  }
);

const { t } = useI18n();

const calculatePrice = (material: Material) => {
  const quantity = material.quantity || 0;
  const unitPrice = material.unitPrice || 0;
  return (quantity * unitPrice).toFixed(2);
};

const calculateTotal = () => {
  return props.materials
    .reduce((sum: number, material: Material) => {
      const quantity = material.quantity || 0;
      const unitPrice = material.unitPrice || 0;
      return sum + quantity * unitPrice;
    }, 0)
    .toFixed(2);
};
</script>
