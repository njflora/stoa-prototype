<script setup lang="ts">
import { RouterView } from 'vue-router'
import DemoControls from './components/DemoControls.vue'
import MobileTabBar from './components/MobileTabBar.vue'
import PitchNoteDrawer from './components/PitchNoteDrawer.vue'
import PreviewBanner from './components/PreviewBanner.vue'
import SearchOverlay from './components/SearchOverlay.vue'
import SiteFooter from './components/SiteFooter.vue'
import SiteHeader from './components/SiteHeader.vue'
import StoaIntro from './components/StoaIntro.vue'
</script>

<template>
  <PreviewBanner />
  <SiteHeader />
  <RouterView />
  <SiteFooter />
  <MobileTabBar />
  <DemoControls />
  <SearchOverlay />
  <PitchNoteDrawer />
  <StoaIntro />
</template>
