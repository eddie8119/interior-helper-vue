<template>
  <router-link to="/">
    <img
      src="@/assets/logos/CompanyLogoMobile-HSWE.png"
      :alt="`logo-Icon`"
      class="icon-logo --mobile h-6 w-12 md:hidden"
    />
    <div class="flex items-center gap-1">
      <img
        src="@/assets/logos/CompanyLogo-HSWE.png"
        :alt="`logo-Icon`"
        class="icon-logo --desktop hidden h-[38px] w-[33px] md:block"
      />
      <p class="text-sm font-semibold">DesignerHelper</p>
    </div>
  </router-link>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped></style>
