<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import ContentRow from '@/components/ContentRow.vue'
import SeriesCard from '@/components/SeriesCard.vue'
import TitleCard from '@/components/TitleCard.vue'
import { allSeries, episodesForShow, getSeries, getShow, hostNames } from '@/data/catalogue'
import { useViewer } from '@/composables/useViewer'
import { useWatchProgress } from '@/composables/useWatchProgress'
import { formatDuration, formatRelativeDate, toRoman } from '@/utils/format'

// One series, meant to be watched in order. The main button always picks
// the right place to start: Part I, the next unwatched part, or the start
// again once every part is watched.

const route = useRoute()
const { canWatch } = useViewer()
const { progressFor, isWatched } = useWatchProgress()

const series = computed(() => getSeries(String(route.params.slug)))
const show = computed(() => (series.value ? getShow(series.value.showId) : undefined))
const locked = computed(() => !!series.value && !series.value.episodes.every((e) => canWatch(e)))

const watchedCount = computed(
  () => series.value?.episodes.filter((e) => isWatched(e.id)).length ?? 0,
)

/** Where "play" should start, and what the button says. */
const start = computed(() => {
  const parts = series.value?.episodes ?? []
  // A part already started comes first, then the first unwatched part.
  const started = parts.find((e) => progressFor(e.id) > 0 && !isWatched(e.id))
  const next = started ?? parts.find((e) => !isWatched(e.id))
  if (!next) return { episode: parts[0], label: 'Watch again from Part I' }
  const part = toRoman(next.series!.part)
  if (next === parts[0] && progressFor(next.id) === 0) return { episode: next, label: 'Play from Part I' }
  return { episode: next, label: `Continue with Part ${part}` }
})

/** A free taste of the same show, for viewers who cannot watch the series. */
const freePreview = computed(() =>
  show.value ? episodesForShow(show.value.id).find((e) => e.access === 'freemium') : undefined,
)

const otherSeries = computed(() =>
  allSeries.filter((s) => s.showId === series.value?.showId && s.slug !== series.value?.slug),
)

// Name the browser tab after the series.
watchEffect(() => {
  if (series.value) document.title = `${series.value.name} · Stoa`
})

function watchLink(episodeId: string) {
  return { path: `/watch/${episodeId}`, query: { series: series.value!.slug } }
}
</script>

<template>
  <main v-if="series && show">
    <section class="relative min-h-[420px] overflow-hidden">
      <TitleCard :show="show" :show-text="false" size="hero" :animated="!locked" />
      <div class="absolute inset-0 bg-gradient-to-r from-ink via-ink/75 to-ink/20" />
      <div class="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink to-transparent" />

      <div class="relative max-w-2xl px-4 pt-16 pb-10 sm:px-8 sm:pt-24">
        <p class="font-serif text-sm font-bold tracking-widest text-white/70 uppercase">
          {{ show.name }} · Series
        </p>
        <h1 class="mt-2 text-3xl leading-tight font-bold text-balance sm:text-5xl">{{ series.name }}</h1>
        <p class="mt-2 text-sm text-white/75">
          {{ hostNames(series.episodes[0]!.hostIds) }} · {{ series.episodes.length }} parts ·
          {{ formatDuration(series.totalMin) }}
        </p>
        <p class="mt-4 text-white/85">{{ series.description }}</p>

        <div v-if="!locked" class="mt-4 flex items-center gap-3 text-sm">
          <div class="h-1.5 w-40 overflow-hidden rounded-full bg-white/20">
            <div
              class="h-full bg-accent-bright"
              :style="{ width: `${(watchedCount / series.episodes.length) * 100}%` }"
            />
          </div>
          <span class="text-white/75">{{ watchedCount }} of {{ series.episodes.length }} watched</span>
        </div>

        <div class="mt-6 flex flex-wrap gap-3">
          <RouterLink
            v-if="!locked && start.episode"
            :to="watchLink(start.episode.id)"
            class="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-ink hover:brightness-95"
          >
            <AppIcon name="play" />
            {{ start.label }}
          </RouterLink>
          <template v-else>
            <RouterLink
              to="/join"
              class="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-ink hover:brightness-110 [&>svg]:size-4"
            >
              <AppIcon name="crown" />
              Upgrade to watch the series
            </RouterLink>
            <RouterLink
              v-if="freePreview"
              :to="`/watch/${freePreview.id}`"
              class="inline-flex items-center gap-2 rounded-lg bg-white/15 px-5 py-2.5 text-sm font-semibold backdrop-blur hover:bg-white/25"
            >
              <AppIcon name="play" />
              Watch a free {{ show.name }} preview
            </RouterLink>
          </template>
        </div>
      </div>
    </section>

    <section class="px-4 pt-4 sm:px-8" aria-labelledby="parts-heading">
      <h2 id="parts-heading" class="text-lg font-semibold sm:text-xl">Play in order</h2>
      <ol class="mt-4 max-w-4xl divide-y divide-white/5">
        <li v-for="episode in series.episodes" :key="episode.id">
          <RouterLink
            :to="canWatch(episode) ? watchLink(episode.id) : '/join'"
            class="group flex items-center gap-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-accent-bright"
            :aria-label="
              canWatch(episode)
                ? undefined
                : `Part ${toRoman(episode.series!.part)}, ${episode.title}. Members only.`
            "
          >
            <span class="w-8 shrink-0 text-center font-serif text-xl font-bold text-white/50">
              {{ toRoman(episode.series!.part) }}
            </span>
            <div class="relative aspect-video w-32 shrink-0 overflow-hidden rounded-md ring-1 ring-white/10 sm:w-40">
              <TitleCard
                :show="show"
                :show-text="false"
                :animated="false"
                :class="canWatch(episode) ? '' : 'scale-110 blur-sm brightness-75'"
              />
              <span v-if="!canWatch(episode)" class="absolute inset-0 grid place-items-center [&_svg]:size-4">
                <span class="grid size-7 place-items-center rounded-full bg-black/55 ring-1 ring-white/20">
                  <AppIcon name="lock" />
                </span>
              </span>
              <div v-else-if="progressFor(episode.id) > 0" class="absolute inset-x-0 bottom-0 h-1 bg-white/20">
                <div class="h-full bg-accent-bright" :style="{ width: `${Math.round(progressFor(episode.id) * 100)}%` }" />
              </div>
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate font-medium group-hover:text-white/80">{{ episode.title }}</p>
              <p class="mt-0.5 text-xs text-muted">
                Part {{ toRoman(episode.series!.part) }} of {{ toRoman(episode.series!.of) }} ·
                {{ formatDuration(episode.durationMin) }} · {{ formatRelativeDate(episode.publishedAt) }}
              </p>
            </div>
            <span v-if="isWatched(episode.id)" class="shrink-0 text-accent-bright" aria-label="Watched">
              <AppIcon name="check" />
            </span>
          </RouterLink>
        </li>
      </ol>
    </section>

    <ContentRow v-if="otherSeries.length" :title="`More series from ${show.name}`" class="pt-10">
      <SeriesCard v-for="s in otherSeries" :key="s.slug" :series="s" />
    </ContentRow>
  </main>

  <main v-else class="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
    <h1 class="font-serif text-4xl font-bold">Series not found</h1>
    <RouterLink to="/" class="mt-6 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-ink">Back to home</RouterLink>
  </main>
</template>
