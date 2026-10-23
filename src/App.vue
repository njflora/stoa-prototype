<script setup lang="ts">
import { defineAsyncComponent, ref, watch } from 'vue'
import { RouterView } from 'vue-router'
import DemoControls from './components/DemoControls.vue'
import MobileTabBar from './components/MobileTabBar.vue'
import OfflineNotice from './components/OfflineNotice.vue'
import PitchNoteDrawer from '@/pitch/PitchNoteDrawer.vue'
import PreviewBanner from './components/PreviewBanner.vue'
import SearchOverlay from './components/SearchOverlay.vue'
import SiteFooter from './components/SiteFooter.vue'
import SiteHeader from './components/SiteHeader.vue'
import UpdatePrompt from './components/UpdatePrompt.vue'
import { useIntro } from './composables/useIntro'

// The welcome is loaded the first time it shows (a first visit, ?intro=1 or
// "Replay intro"), then kept, so returning visitors never download it.
const StoaIntro = defineAsyncComponent(() => import('./components/intro/StoaIntro.vue'))
const { open: introOpen } = useIntro()
const introNeeded = ref(introOpen.value)
watch(introOpen, (open) => {
  if (open) introNeeded.value = true
})
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
  <StoaIntro v-if="introNeeded" />
  <UpdatePrompt />
</template>
