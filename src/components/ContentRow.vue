<script setup lang="ts">
import { onMounted, onUnmounted, ref, useId } from 'vue'
import AppIcon from './AppIcon.vue'

// A horizontal row of cards. Swipe or scroll on any device; on larger
// screens, arrow buttons page through it. Cards snap into place.

defineProps<{
  title: string
  subtitle?: string
}>()

// useId gives a unique id, used to link the heading to the section for screen readers.
const headingId = useId()
const track = ref<HTMLElement>()
const canGoBack = ref(false)
const canGoForward = ref(false)
let resizeObserver: ResizeObserver | undefined

function updateArrows() {
  const el = track.value
  if (!el) return
  canGoBack.value = el.scrollLeft > 4
  canGoForward.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 4
}

function page(direction: 1 | -1) {
  const el = track.value
  if (!el) return
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: reduceMotion ? 'auto' : 'smooth' })
}

onMounted(() => {
  updateArrows()
  if (track.value && 'ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(updateArrows)
    resizeObserver.observe(track.value)
  }
})
onUnmounted(() => resizeObserver?.disconnect())
</script>

<template>
  <section :aria-labelledby="headingId">
    <div class="mb-3 flex items-end justify-between gap-4 px-4 sm:px-8">
      <div class="min-w-0">
        <h2 :id="headingId" class="text-lg font-semibold sm:text-xl">{{ title }}</h2>
        <p v-if="subtitle" class="truncate text-sm text-muted">{{ subtitle }}</p>
      </div>
      <slot name="action" />
    </div>

    <div class="group/row relative">
      <div
        ref="track"
        class="no-scrollbar flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 sm:scroll-px-8 sm:gap-4 sm:px-8"
        @scroll.passive="updateArrows"
      >
        <slot />
      </div>

      <button
        v-show="canGoBack"
        type="button"
        class="absolute top-0 left-0 hidden h-[calc(100%-3.5rem)] w-12 place-items-center bg-gradient-to-r from-ink to-transparent opacity-0 transition group-hover/row:opacity-100 focus-visible:opacity-100 sm:grid"
        aria-label="Scroll back"
        @click="page(-1)"
      >
        <AppIcon name="chevron-left" />
      </button>
      <button
        v-show="canGoForward"
        type="button"
        class="absolute top-0 right-0 hidden h-[calc(100%-3.5rem)] w-12 place-items-center bg-gradient-to-l from-ink to-transparent opacity-0 transition group-hover/row:opacity-100 focus-visible:opacity-100 sm:grid"
        aria-label="Scroll forward"
        @click="page(1)"
      >
        <AppIcon name="chevron-right" />
      </button>
    </div>
  </section>
</template>
