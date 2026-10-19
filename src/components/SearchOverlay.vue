<script setup lang="ts">
import { defineAsyncComponent, nextTick, watch } from 'vue'
import { useSearchOverlay } from '@/composables/useSearchOverlay'

// Search opens over the current page, which stays visible behind it.
// This part is always present but tiny. The panel, and the search engine
// with it, load the first time someone opens search. That is an async
// component: Vite splits it into its own file, fetched on demand.
const SearchPanel = defineAsyncComponent(() => import('./SearchPanel.vue'))

const { isOpen, closeSearch } = useSearchOverlay()

// While open: the page behind does not scroll, and closing returns focus
// to whatever had it before (such as the search button).
let returnFocusTo: HTMLElement | null = null
watch(
  isOpen,
  async (open) => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
    if (open) {
      returnFocusTo = document.activeElement as HTMLElement | null
    } else {
      await nextTick()
      if (returnFocusTo?.isConnected) returnFocusTo.focus()
      returnFocusTo = null
    }
  },
  { immediate: true },
)
</script>

<template>
  <Teleport to="body">
    <Transition name="search">
      <div
        v-if="isOpen"
        class="fixed inset-x-0 top-0 z-[52] flex justify-center px-2 pt-2 sm:px-4 sm:pt-[8vh]"
        :style="{ bottom: 'var(--tabbar-h)' }"
      >
        <!-- Barely dims the page: it stays readable behind the search. -->
        <div class="absolute inset-0 bg-ink/20" aria-hidden="true" @click="closeSearch" />
        <SearchPanel class="search-panel relative" />
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.search-enter-active,
.search-leave-active {
  transition: opacity 150ms ease;
}
.search-enter-active .search-panel,
.search-leave-active .search-panel {
  transition: transform 150ms ease;
}
.search-enter-from,
.search-leave-to {
  opacity: 0;
}
.search-enter-from .search-panel,
.search-leave-to .search-panel {
  transform: translateY(-8px);
}
@media (prefers-reduced-motion: reduce) {
  .search-enter-active,
  .search-leave-active,
  .search-enter-active .search-panel,
  .search-leave-active .search-panel {
    transition: none;
  }
}
</style>
