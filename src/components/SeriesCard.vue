<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from './AppIcon.vue'
import PreviewSoundButton from './PreviewSoundButton.vue'
import TitleCard from './TitleCard.vue'
import { getShow, hostNames } from '@/data/catalogue'
import { usePreview } from '@/composables/usePreview'
import { useViewer } from '@/composables/useViewer'
import { useWatchProgress } from '@/composables/useWatchProgress'
import type { Series } from '@/types/content'
import { artForSeries } from '@/data/media'
import { formatDuration } from '@/utils/format'

// A whole series as one card. It links to the series page, which anyone
// can browse; members' series show a small lock for free viewers.

const props = defineProps<{
  series: Series
  /** Fill a grid cell instead of the fixed width used in rows. */
  fluid?: boolean
}>()

const { isMember } = useViewer()
const { isWatched } = useWatchProgress()

const show = computed(() => getShow(props.series.showId))
const locked = computed(() => show.value.access === 'premium' && !isMember.value)
const { root, previewing, handlers } = usePreview(() => !locked.value)
const watched = computed(() => props.series.episodes.filter((e) => isWatched(e.id)).length)
</script>

<template>
  <div class="relative" :class="fluid ? 'min-w-0' : 'w-60 flex-none snap-start sm:w-72'" v-on="handlers">
    <PreviewSoundButton v-if="previewing" />
    <RouterLink
      :to="`/series/${series.slug}`"
      class="group block outline-none"
    >
      <div
        ref="root"
        class="relative aspect-video overflow-hidden rounded-lg ring-1 ring-white/10 transition duration-300 group-hover:ring-white/30 group-focus-visible:ring-2 group-focus-visible:ring-accent-bright"
      >
        <TitleCard
          :show="show"
          :art="artForSeries(series.name)"
          :label="`${series.episodes.length} parts · ${formatDuration(series.totalMin)}`"
          :animated="previewing"
          :preview="previewing"
          sound-button
          class="transition duration-500 group-hover:scale-105"
        />
        <span
          class="absolute top-2 left-2 rounded bg-white px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-ink uppercase"
        >
          Series
        </span>
        <span
          v-if="locked"
          class="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-black/55 ring-1 ring-white/20 [&>svg]:size-4"
          aria-label="Members only"
        >
          <AppIcon name="lock" />
        </span>
        <div v-if="watched && !previewing" class="absolute inset-x-0 bottom-0 h-1 bg-white/20">
          <div class="h-full bg-accent-bright" :style="{ width: `${(watched / series.episodes.length) * 100}%` }" />
        </div>
      </div>
      <div class="mt-2 px-0.5">
        <p class="line-clamp-2 text-sm leading-snug font-medium text-white/90 group-hover:text-white">
          {{ series.name }}
        </p>
        <p class="mt-0.5 truncate text-xs text-muted">
          {{ show.name }} · {{ hostNames(series.episodes[0]!.hostIds) }}
        </p>
      </div>
    </RouterLink>
  </div>
</template>
