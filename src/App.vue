<script setup lang="ts">
import { RouterView } from 'vue-router'
import DemoControls from './components/DemoControls.vue'
import MobileTabBar from './components/MobileTabBar.vue'
import OfflineNotice from './components/OfflineNotice.vue'
import PitchNoteDrawer from '@/pitch/PitchNoteDrawer.vue'
import PreviewBanner from './components/PreviewBanner.vue'
import SearchOverlay from './components/SearchOverlay.vue'
import SiteFooter from './components/SiteFooter.vue'
import SiteHeader from './components/SiteHeader.vue'
import StoaIntro from './components/StoaIntro.vue'
import UpdatePrompt from './components/UpdatePrompt.vue'
</script>

<template>
  <PreviewBanner />
  <SiteHeader />
  <OfflineNotice />
  <RouterView />
  <SiteFooter />
  <MobileTabBar />
  <DemoControls />
  <SearchOverlay />
  <PitchNoteDrawer />
  <StoaIntro />
  <UpdatePrompt />
</template>
