<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { API_MODE } from '@/api/client'

// In the static preview, say plainly what it is. The Laravel version checks
// access on the server. Its height is published as --banner-h, like the
// header's, so full-height layouts such as the live page still fit.

const banner = ref<HTMLElement>()
let resizeObserver: ResizeObserver | undefined
onMounted(() => {
  if (!banner.value) return
  // Once straight away, then again whenever it wraps to a new height.
  document.documentElement.style.setProperty('--banner-h', `${banner.value.offsetHeight}px`)
  if (!('ResizeObserver' in window)) return
  resizeObserver = new ResizeObserver(([entry]) => {
    const height = entry?.borderBoxSize?.[0]?.blockSize ?? banner.value!.offsetHeight
    document.documentElement.style.setProperty('--banner-h', `${height}px`)
  })
  resizeObserver.observe(banner.value)
})
onUnmounted(() => resizeObserver?.disconnect())
</script>

<template>
  <p
    v-if="API_MODE === 'static'"
    ref="banner"
    class="border-b border-white/5 bg-surface px-4 py-1.5 text-center text-xs text-muted sm:px-8"
  >
    <span class="font-semibold text-white">Preview:</span> saved in this browser, with access checked here rather than on a server.
  </p>
</template>
