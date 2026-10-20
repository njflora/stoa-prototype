<script setup lang="ts">
import { computed, useId } from 'vue'
import MembersGate from './MembersGate.vue'
import PitchNote from './PitchNote.vue'
import { RouterLink } from 'vue-router'
import { readingListForThread } from '@/data/episodeExtras'
import type { ReadingItem, SourceType } from '@/data/readingLists'
import { useViewer } from '@/composables/useViewer'
import type { Episode } from '@/types/content'
import { formatClock } from '@/utils/format'

// The sources behind an episode, in the order they came up. The same
// block can sit on any episode or article, so sourcing looks the same
// everywhere. Free on the free shows and articles; on members' shows it is
// for members, behind the same blurred gate as the discussion (Nick's call).

const props = defineProps<{
  /** Which list to show: an episode id, or a hand-written list such as "live-show". */
  listId?: string
  /** The episode, so its list can be generated. Not needed for hand-written lists. */
  episode?: Episode
  /** The list itself, when the page already has it (articles bring their own). */
  items?: ReadingItem[]
  /** What the sources belong to, for the line under the heading. */
  context?: 'episode' | 'article'
  /** On members' shows: non-members see a blurred glimpse instead. */
  membersOnly?: boolean
}>()

const { isMember } = useViewer()
const exclusive = computed(() => props.membersOnly && !isMember.value)

const headingId = useId()

const items = computed(() =>
  [...(props.items ?? readingListForThread(props.listId ?? '', props.episode))].sort((a, b) => (a.at ?? 0) - (b.at ?? 0)),
)

const gateText = computed(() => ({
  title: "The members' reading list",
  detail: `${items.value.length} ${items.value.length === 1 ? 'source' : 'sources'} behind this episode. Join to see them.`,
}))

const typeStyles: Record<SourceType, string> = {
  Book: 'bg-gold/15 text-gold',
  Article: 'bg-accent/25 text-accent-bright',
  Report: 'bg-[#4f8fc0]/20 text-[#8fbde0]',
  Data: 'bg-[#2a9d8f]/20 text-[#7fd1c6]',
}
</script>

<template>
  <section :aria-labelledby="headingId" class="rounded-xl bg-surface p-4 ring-1 ring-white/10">
    <div class="flex flex-wrap items-center gap-2">
      <h2 :id="headingId" class="text-lg font-semibold">
        Reading list <span class="text-muted">({{ items.length }})</span>
      </h2>
      <PitchNote id="reading-lists" />
    </div>
    <p class="text-sm text-muted">{{ context === 'article' ? 'The sources behind this article' : 'Sources mentioned in this episode' }}</p>

    <!-- The same list either way; for non-members on members' shows, a blurred glimpse of it. -->
    <component
      :is="exclusive ? MembersGate : 'div'"
      v-bind="exclusive ? gateText : {}"
      class="mt-4"
    >
      <ol class="space-y-4">
        <li v-for="item in exclusive ? items.slice(0, 3) : items" :key="item.id" class="border-t border-white/5 pt-4 first:border-0 first:pt-0">
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
    </component>
  </section>
</template>
