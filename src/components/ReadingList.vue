<script setup lang="ts">
import { computed, useId } from 'vue'
import { RouterLink } from 'vue-router'
import { readingListForThread } from '@/data/episodeExtras'
import type { SourceType } from '@/data/readingLists'
import { formatClock } from '@/utils/format'

// The sources behind an episode, in the order they came up. The same
// block can sit on any episode or article, so sourcing looks the same
// everywhere. Free for everyone.

const props = defineProps<{
  /** Which list to show: an episode id, or a hand-written list such as "stoa-podcast-1432". */
  listId: string
}>()

const headingId = useId()

const items = computed(() =>
  [...readingListForThread(props.listId)].sort((a, b) => (a.at ?? 0) - (b.at ?? 0)),
)

const typeStyles: Record<SourceType, string> = {
  Book: 'bg-gold/15 text-gold',
  Article: 'bg-accent/25 text-accent-bright',
  Report: 'bg-[#4f8fc0]/20 text-[#8fbde0]',
  Data: 'bg-[#2a9d8f]/20 text-[#7fd1c6]',
}
</script>

<template>
  <section :aria-labelledby="headingId" class="rounded-xl bg-surface p-4 ring-1 ring-white/10">
    <h2 :id="headingId" class="text-lg font-semibold">
      Reading list <span class="text-muted">({{ items.length }})</span>
    </h2>
    <p class="text-sm text-muted">Sources mentioned in this episode</p>

    <ol class="mt-4 space-y-4">
      <li v-for="item in items" :key="item.id" class="border-t border-white/5 pt-4 first:border-0 first:pt-0">
        <span class="rounded px-1.5 py-px text-[10px] font-bold tracking-wide uppercase" :class="typeStyles[item.type]">
          {{ item.type }}
        </span>
        <p class="mt-1.5 text-sm leading-snug font-semibold">
          <RouterLink v-if="item.to" :to="item.to" class="underline decoration-white/30 underline-offset-2 hover:decoration-white">
            {{ item.title }}
          </RouterLink>
          <template v-else>{{ item.title }}</template>
        </p>
        <p class="mt-0.5 text-xs text-white/70">{{ item.source }}, {{ item.year }}</p>
        <p v-if="item.at !== undefined" class="mt-0.5 text-xs text-muted">
          Mentioned at <span class="tabular-nums">{{ formatClock(item.at) }}</span>
        </p>
      </li>
    </ol>
  </section>
</template>
