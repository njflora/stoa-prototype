<script setup lang="ts">
import { watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useOnline } from '@/composables/useOnline'

// Shown when part of a page could not load because the connection is gone
// and that page was never saved for offline use. Pages already visited
// still open offline, from the copies the service worker keeps. It sits
// above the page, so anything that did load stays in view.
const { missedOffline } = useOnline()
const route = useRoute()

// Each page starts fresh: the notice returns only if that page also misses.
watch(
  () => route.path,
  () => (missedOffline.value = false),
)

function retry() {
  window.location.reload()
}
</script>

<template>
  <section
    v-if="missedOffline"
    role="status"
    aria-labelledby="offline-heading"
    class="mx-4 mt-6 rounded-xl bg-raised p-6 text-center ring-1 ring-white/10 sm:mx-8"
  >
    <h2 id="offline-heading" class="font-serif text-2xl font-bold">You're offline</h2>
    <p class="mx-auto mt-2 max-w-md text-sm text-white/75">
      This page hasn't been saved for offline use yet. Pages you have already opened still work. It will load when
      you're back online.
    </p>
    <div class="mt-4 flex justify-center gap-3">
      <button type="button" class="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-ink" @click="retry">
        Try again
      </button>
      <RouterLink to="/" class="rounded-lg px-4 py-2 text-sm font-semibold ring-1 ring-white/25 hover:bg-white/10"
        >Home</RouterLink
      >
    </div>
  </section>
</template>
