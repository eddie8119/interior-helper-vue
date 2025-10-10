<template>
  <div v-if="materials && materials.length > 0" class="mt-1">
    <div class="space-y-1">
      <div v-for="material in materials" :key="material.id" class="flex items-center gap-1">
        <span class="mr-1 text-gray-600">•</span>
        <span class="mr-1 font-medium">{{ material.name }}:</span>
        <span>{{ material.quantity }} x ${{ material.unitPrice }}</span>
        <span>=</span>
        <span>${{ calculatePrice(material) }}</span>
      </div>
    </div>
    <div
      v-if="showTotal && materials.length > 1"
      class="mt-2 border-t pt-1 text-sm font-semibold text-gray-800"
    >
      總計: ${{ calculateTotal() }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Material {
  id?: string;
  name: string;
  quantity?: number;
  unitPrice?: number;
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
