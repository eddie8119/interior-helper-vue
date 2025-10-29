<template>
  <router-link to="/">
    <img
      src="@/assets/logos/CompanyLogoMobile-HSWE.png"
      :alt="`logo-Icon`"
      class="icon-logo --mobile h-6 w-12 md:hidden"
    />
    <img
      src="@/assets/logos/CompanyLogo-HSWE.png"
      :alt="`logo-Icon`"
      class="icon-logo --desktop hidden h-[38px] w-[80px] md:block"
    />
  </router-link>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped></style>
