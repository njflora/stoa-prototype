<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'
import AppIcon from './AppIcon.vue'

// Page numbers for long lists: Previous, 1 … 4 5 6 … 31, Next.
// Each page is a real link (the page number lives in the address), so
// pages can be shared, opened in a new tab, and reached with Back.

const props = defineProps<{
  /** The current page, counting from 0 as the API does. */
  page: number
  pageCount: number
  /** The address of a given page. */
  to: (page: number) => RouteLocationRaw
}>()

/** The page numbers to show, with null where a gap ("…") goes. */
const items = computed(() => {
  const last = props.pageCount - 1
  const keep = new Set([0, last, props.page - 1, props.page, props.page + 1].filter((p) => p >= 0 && p <= last))
  const sorted = [...keep].sort((a, b) => a - b)
  const out: (number | null)[] = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1]! > 1) out.push(null)
    out.push(p)
  })
  return out
})

const arrow =
  'inline-flex min-h-9 items-center gap-1 rounded-lg px-3 text-sm font-medium ring-1 ring-white/10 hover:bg-white/10 [&>svg]:size-4'
const number = 'grid min-h-9 min-w-9 place-items-center rounded-lg px-2 text-sm tabular-nums'
</script>

<template>
  <nav v-if="pageCount > 1" aria-label="Pages" class="flex flex-wrap items-center justify-center gap-1.5">
    <RouterLink v-if="page > 0" :to="to(page - 1)" :class="arrow" rel="prev">
      <AppIcon name="chevron-left" /> <span>Previous</span>
    </RouterLink>
    <template v-for="(item, i) in items" :key="i">
      <span v-if="item === null" class="px-1 text-muted" aria-hidden="true">…</span>
      <span v-else-if="item === page" :class="[number, 'bg-white font-semibold text-ink']" aria-current="page">
        <span class="sr-only">Page </span>{{ item + 1 }}
      </span>
      <RouterLink v-else :to="to(item)" :class="[number, 'text-white/80 hover:bg-white/10 hover:text-white']">
        <span class="sr-only">Page </span>{{ item + 1 }}
      </RouterLink>
    </template>
    <RouterLink v-if="page < pageCount - 1" :to="to(page + 1)" :class="arrow" rel="next">
      <span>Next</span> <AppIcon name="chevron-right" />
    </RouterLink>
  </nav>
</template>
