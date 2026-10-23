<script setup lang="ts">
import { computed, useId } from 'vue'
import MembersGate from './MembersGate.vue'
import PitchNote from './PitchNote.vue'
import { RouterLink } from 'vue-router'
import { canRead } from '@/access/rules'
import { API_MODE } from '@/api/client'
import { getReadingList, type ThreadRef } from '@/api/discussion'
import type { ReadingItem, SourceType } from '@/data/readingLists'
import { useQuery } from '@/composables/useQuery'
import { useViewer } from '@/composables/useViewer'
import { formatClock } from '@/utils/format'

// The sources behind an episode, in the order they came up. The same
// block can sit on any episode or article, so sourcing looks the same
// everywhere. Free on the free shows and articles; on members' shows it is
// for members, behind the same gate as the discussion (a design decision). In
// Laravel mode the server decides, and sends a non-member the count only;
// the static preview applies the same rule in the page.

const props = defineProps<{
  /** Whose list to load: an episode's or the live show's. */
  thread?: ThreadRef
  /** Or the list itself, when the page already has it (articles bring their own). */
  items?: ReadingItem[]
  /** What the sources belong to, for the line under the heading. */
  context?: 'episode' | 'article'
}>()

const { viewer, access } = useViewer()
const headingId = useId()

// Asked again when the viewer changes: the answer depends on who is asking.
const { data, loading, error, reload } = useQuery(
  () => `${JSON.stringify(props.thread)}|${viewer.value}`,
  async () => (props.thread ? getReadingList(props.thread) : null),
)

const locked = computed(() => {
  const list = data.value
  if (!list) return false
  return API_MODE === 'laravel' ? list.locked : !canRead(access.value, list)
})
const count = computed(() => (props.items ? props.items.length : (data.value?.count ?? 0)))
const items = computed(() => {
  const list = props.items ?? (data.value && !data.value.locked ? data.value.items : [])
  return [...list].sort((a, b) => (a.at ?? 0) - (b.at ?? 0))
})

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
        Reading list <span v-if="data || items.length" class="text-muted">({{ count }})</span>
      </h2>
      <PitchNote :id="context === 'article' ? 'article-reading-lists' : 'reading-lists'" />
    </div>
    <p class="text-sm text-muted">
      {{ context === 'article' ? 'The sources behind this article' : 'Sources mentioned in this episode' }}
    </p>

    <p v-if="thread && loading && !data" class="mt-4 text-sm text-muted">Loading sources…</p>
    <div v-else-if="thread && error && !data" class="mt-4 flex items-center gap-3 text-sm text-muted">
      The sources could not load.
      <button type="button" class="font-semibold text-white underline underline-offset-2" @click="reload">
        Try again
      </button>
    </div>

    <!-- A members' list seen by a non-member. -->
    <MembersGate
      v-else-if="locked"
      class="mt-4"
      kind="sources"
      title="The members' reading list"
      :detail="`${count} ${count === 1 ? 'source' : 'sources'} behind this episode. Join to see them.`"
    />

    <div v-else class="mt-4">
      <ol class="space-y-4">
        <li
          v-for="item in items"
          :key="`${item.title}-${item.at}`"
          class="border-t border-white/5 pt-4 first:border-0 first:pt-0"
        >
          <span
            class="rounded px-1.5 py-px text-[10px] font-bold tracking-wide uppercase"
            :class="typeStyles[item.type]"
          >
            {{ item.type }}
          </span>
          <p class="mt-1.5 text-sm leading-snug font-semibold">
            <RouterLink
              v-if="item.to"
              :to="item.to"
              class="underline decoration-white/30 underline-offset-2 hover:decoration-white"
            >
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
    </div>
  </section>
</template>
