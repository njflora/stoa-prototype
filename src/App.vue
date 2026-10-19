<script setup lang="ts">
import { RouterView } from 'vue-router'
import DemoControls from './components/DemoControls.vue'
import SiteFooter from './components/SiteFooter.vue'
import SiteHeader from './components/SiteHeader.vue'
</script>

<template>
  <SiteHeader />
  <RouterView />
  <SiteFooter />
  <DemoControls />
</template>
