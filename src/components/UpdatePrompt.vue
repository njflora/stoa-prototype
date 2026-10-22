<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue'

// Registers the service worker that makes the site installable and work
// offline. When a new version is ready, it waits and says so here, rather
// than reloading the page under the visitor. Nothing registers in
// `npm run dev`, so this stays hidden there.
const { needRefresh, updateServiceWorker } = useRegisterSW()
</script>

<template>
  <div
    v-if="needRefresh"
    role="status"
    class="fixed right-4 z-50 flex items-center gap-3 rounded-xl bg-raised/95 px-4 py-3 text-sm shadow-2xl ring-1 ring-white/10 backdrop-blur"
    :style="{ bottom: 'calc(var(--tabbar-h) + 1rem)' }"
  >
    <span>Update available</span>
    <button
      type="button"
      class="rounded-md bg-accent px-3 py-1 text-xs font-semibold text-white hover:bg-accent-bright"
      @click="updateServiceWorker(true)"
    >
      Reload
    </button>
    <button type="button" class="text-xs text-muted underline hover:text-white" @click="needRefresh = false">
      Later
    </button>
  </div>
</template>
