<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from './AppIcon.vue'
import TitleCard from './TitleCard.vue'
import { episodeLabel, getShow, hostNames, isNew, seriesOf } from '@/data/catalogue'
import type { Episode } from '@/types/content'
import { artForEpisode } from '@/data/media'
import { usePreview } from '@/composables/usePreview'
import { formatRelativeDate, toRoman } from '@/utils/format'

const props = withDefaults(
  defineProps<{
    episode: Episode
    /** Blurred, still and behind a lock, with a prompt to join. */
    locked?: boolean
    /** 0 to 1. Shows a progress bar when above 0. */
    progress?: number
    /** "show" captions the card with the show name, for the Start here row. */
    variant?: 'episode' | 'show'
  }>(),
  { locked: false, progress: 0, variant: 'episode' },
)

const show = computed(() => getShow(props.episode.showId))

const caption = computed(() =>
  props.variant === 'show' ? `Start with: ${props.episode.title}` : props.episode.title,
)
const subcaption = computed(() =>
  props.variant === 'show'
    ? show.value.tagline
    : `${hostNames(props.episode.hostIds)} · ${formatRelativeDate(props.episode.publishedAt)}`,
)

const badge = computed(() => {
  if (props.episode.access === 'freemium') return { text: 'Free preview', class: 'bg-accent text-white' }
  if (props.episode.access === 'premium' && !props.locked)
    return { text: 'Members', class: 'bg-gold text-ink' }
  if (isNew(props.episode)) return { text: 'New', class: 'bg-white text-ink' }
  return null
})

const series = computed(() => seriesOf(props.episode))

// Series episodes open with their series queue alongside.
const to = computed(() => {
  if (props.locked) return '/join'
  const path = `/watch/${props.episode.id}`
  return series.value ? { path, query: { series: series.value.slug } } : path
})
const label = computed(() =>
  props.locked ? `${caption.value}. Members only. Join to watch.` : undefined,
)

// Still at rest; plays a preview on hover, focus, or (on phones) when it
// is the card in view. Locked cards never preview.
const { root, previewing, handlers } = usePreview(() => !props.locked)
</script>

<template>
  <!-- A wrapper, so the series link can sit beside the main link rather than inside it. -->
  <div ref="root" class="w-60 flex-none snap-start sm:w-72" v-on="handlers">
    <RouterLink :to="to" :aria-label="label" class="group block outline-none">
      <div
        class="relative aspect-video overflow-hidden rounded-lg bg-surface ring-1 ring-white/10 transition duration-300 group-hover:ring-white/30 group-focus-visible:ring-2 group-focus-visible:ring-accent-bright"
      >
        <TitleCard
          :show="show"
          :art="artForEpisode(episode)"
          :label="variant === 'show' ? '' : episodeLabel(episode)"
          :animated="previewing"
          :preview="previewing"
          class="transition duration-500"
          :class="locked ? 'scale-110 blur-md brightness-75' : 'group-hover:scale-105'"
        />

        <div v-if="locked" class="absolute inset-0 grid place-items-center">
          <div class="flex flex-col items-center gap-1.5 text-center">
            <span class="grid size-10 place-items-center rounded-full bg-black/55 ring-1 ring-white/20">
              <AppIcon name="lock" />
            </span>
            <span class="text-xs font-semibold tracking-wide uppercase">Members only</span>
            <span
              class="rounded-full bg-gold px-3 py-0.5 text-[11px] font-semibold text-ink opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              Members preview every episode
            </span>
          </div>
        </div>

        <span
          v-if="badge"
          class="absolute top-2 left-2 rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase"
          :class="badge.class"
        >
          {{ badge.text }}
        </span>

        <div v-if="progress > 0 && !locked && !previewing" class="absolute inset-x-0 bottom-0 h-1 bg-white/20">
          <div class="h-full bg-accent-bright" :style="{ width: `${Math.round(progress * 100)}%` }" />
        </div>
      </div>

      <div class="mt-2 px-0.5">
        <p class="line-clamp-2 text-sm leading-snug font-medium text-white/90 group-hover:text-white">
          {{ caption }}
        </p>
        <p class="mt-0.5 truncate text-xs text-muted">{{ subcaption }}</p>
      </div>
    </RouterLink>
    <RouterLink
      v-if="series && variant === 'episode'"
      :to="`/series/${series.slug}`"
      class="mt-0.5 inline-flex min-h-6 items-center px-0.5 text-xs font-medium text-accent-bright hover:underline"
    >
      Part {{ toRoman(episode.series!.part) }} of {{ series.episodes.length }} · See the series
    </RouterLink>
  </div>
</template>
