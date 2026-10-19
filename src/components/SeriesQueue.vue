<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from './AppIcon.vue'
import TitleCard from './TitleCard.vue'
import { getShow } from '@/data/catalogue'
import { usePlayback } from '@/composables/usePlayback'
import { useWatchProgress } from '@/composables/useWatchProgress'
import type { Series } from '@/types/content'
import { formatDuration, toRoman } from '@/utils/format'

// The series as a playlist beside the player: every part in order, the
// current one highlighted, and a switch to play the next part
// automatically.

const props = defineProps<{
  series: Series
  currentId: string
}>()

const { autoplay } = usePlayback()
const { isWatched, progressFor } = useWatchProgress()

const show = computed(() => getShow(props.series.showId))
const index = computed(() => props.series.episodes.findIndex((e) => e.id === props.currentId))
const previous = computed(() => props.series.episodes[index.value - 1])
const next = computed(() => props.series.episodes[index.value + 1])

function link(id: string) {
  return { path: `/watch/${id}`, query: { series: props.series.slug } }
}
</script>

<template>
  <section class="flex flex-col bg-surface lg:rounded-xl lg:ring-1 lg:ring-white/10" aria-labelledby="queue-heading">
    <header class="border-b border-white/5 px-4 py-3">
      <p class="text-xs text-muted">{{ show.name }} · Series</p>
      <h2 id="queue-heading" class="font-semibold">
        <RouterLink :to="`/series/${series.slug}`" class="hover:underline">{{ series.name }}</RouterLink>
      </h2>
      <div class="mt-2 flex items-center justify-between gap-3">
        <p class="text-xs text-white/75">
          Part {{ toRoman(index + 1) }} of {{ toRoman(series.episodes.length) }}
        </p>
        <button
          type="button"
          role="switch"
          :aria-checked="autoplay"
          class="flex items-center gap-2 text-xs text-white/80"
          @click="autoplay = !autoplay"
        >
          Autoplay next part
          <span
            class="relative h-5 w-9 rounded-full transition"
            :class="autoplay ? 'bg-accent' : 'bg-raised'"
            aria-hidden="true"
          >
            <span
              class="absolute top-0.5 size-4 rounded-full bg-white transition-all"
              :class="autoplay ? 'left-4.5' : 'left-0.5'"
            />
          </span>
        </button>
      </div>
    </header>

    <ol class="divide-y divide-white/5">
      <li v-for="(episode, i) in series.episodes" :key="episode.id">
        <RouterLink
          :to="link(episode.id)"
          class="flex items-center gap-3 px-4 py-2.5 transition hover:bg-white/5"
          :class="episode.id === currentId ? 'bg-accent/20' : ''"
          :aria-current="episode.id === currentId ? 'true' : undefined"
        >
          <span class="w-6 shrink-0 text-center font-serif text-sm font-bold text-white/50">
            {{ toRoman(i + 1) }}
          </span>
          <div class="relative aspect-video w-24 shrink-0 overflow-hidden rounded ring-1 ring-white/10">
            <TitleCard :show="show" :show-text="false" :animated="episode.id === currentId" />
            <div v-if="progressFor(episode.id) > 0" class="absolute inset-x-0 bottom-0 h-0.5 bg-white/20">
              <div class="h-full bg-accent-bright" :style="{ width: `${Math.round(progressFor(episode.id) * 100)}%` }" />
            </div>
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm" :class="episode.id === currentId ? 'font-semibold' : 'text-white/85'">
              {{ episode.title }}
            </p>
            <p class="text-xs text-muted">{{ formatDuration(episode.durationMin) }}</p>
          </div>
          <span v-if="isWatched(episode.id)" class="shrink-0 text-accent-bright [&>svg]:size-4" aria-label="Watched">
            <AppIcon name="check" />
          </span>
        </RouterLink>
      </li>
    </ol>

    <footer class="flex justify-between gap-2 border-t border-white/5 p-3 text-sm">
      <RouterLink
        v-if="previous"
        :to="link(previous.id)"
        class="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-white/80 hover:bg-white/10 [&>svg]:size-4"
      >
        <AppIcon name="chevron-left" />
        Previous part
      </RouterLink>
      <span v-else />
      <RouterLink
        v-if="next"
        :to="link(next.id)"
        class="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-white/80 hover:bg-white/10 [&>svg]:size-4"
      >
        Next part
        <AppIcon name="chevron-right" />
      </RouterLink>
    </footer>
  </section>
</template>
