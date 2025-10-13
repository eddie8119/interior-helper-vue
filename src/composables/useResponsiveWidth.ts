import { onBeforeUnmount, onMounted, readonly, ref } from 'vue';

export function useResponsiveWidth() {
  const breakpoint = 768;
  const isMobile = ref(false);

  const updateIsMobile = () => {
    if (typeof window !== 'undefined') {
      isMobile.value = window.innerWidth <= breakpoint;
    }
  };

  onMounted(() => {
    updateIsMobile();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateIsMobile);
    }
  });

  onBeforeUnmount(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', updateIsMobile);
    }
  });

  return {
    isMobile: readonly(isMobile),
  };
}
