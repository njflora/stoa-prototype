<script setup lang="ts">
import { RouterView } from 'vue-router'
import DemoControls from './components/DemoControls.vue'
import MobileTabBar from './components/MobileTabBar.vue'
import PitchNoteDrawer from './components/PitchNoteDrawer.vue'
import SearchOverlay from './components/SearchOverlay.vue'
import SiteFooter from './components/SiteFooter.vue'
import SiteHeader from './components/SiteHeader.vue'
</script>

<template>
  <SiteHeader />
  <RouterView />
  <SiteFooter />
  <MobileTabBar />
  <DemoControls />
  <SearchOverlay />
  <PitchNoteDrawer />
</template>
