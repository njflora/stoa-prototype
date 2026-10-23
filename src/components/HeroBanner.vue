<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from './AppIcon.vue'
import ContributorNames from './ContributorNames.vue'
import PitchNote from '@/pitch/PitchNote.vue'
import HeroVideo from './HeroVideo.vue'
import TitleCard from './TitleCard.vue'
import { getShow } from '@/data/catalogue'
import { artForEpisode, type Artwork } from '@/data/media'
import { useLiveStatus } from '@/composables/useLiveStatus'
import { useViewer } from '@/composables/useViewer'
import type { Episode, Show } from '@/types/content'
import { formatNumber } from '@/utils/format'

// The hero is an enlarged title card. When the flagship show is live it
// takes the hero and stays there, playing on arrival. Otherwise the hero
// rotates through featured episodes.

interface Slide {
  key: string
  show: Show
  kicker: string
  title: string
  hostIds: string[]
  action: { label: string; to: string; join: boolean }
  /** The painting behind an episode slide. The live slide plays video instead. */
  art?: Artwork
}

const ROTATE_MS = 8000

/** The homepage passes in its featured episodes once they have loaded. */
const props = withDefaults(defineProps<{ featured?: Episode[] }>(), { featured: () => [] })

const { isLive, phase, event, countdown } = useLiveStatus()
const { canWatch, isMember } = useViewer()

const slides = computed<Slide[]>(() => {
  if (isLive.value) {
    // In the members' after-show, free viewers are invited to join instead.
    const afterShow = phase.value === 'members'
    const join = afterShow && !isMember.value
    return [
      {
        key: 'live',
        show: getShow(event.showId),
        kicker: 'Live now',
        title: afterShow ? `${event.title}: Members' after-show` : event.title,
        hostIds: event.hostIds,
        action: {
          label: join ? 'Continue as a member' : 'Watch live',
          to: '/live',
          join,
        },
      },
    ]
  }

  // Before the featured episodes arrive, show the next live show.
  if (!props.featured.length) {
    return [
      {
        key: 'next-live',
        show: getShow(event.showId),
        kicker: 'Next live',
        title: event.title,
        hostIds: event.hostIds,
        action: { label: 'Set a reminder', to: '/live', join: false },
      },
    ]
  }

  return props.featured.map((episode) => {
    const locked = !canWatch(episode)
    const kicker =
      episode.access === 'freemium'
        ? 'Free preview'
        : episode.access === 'premium'
          ? locked
            ? "Members' preview"
            : 'New for members'
          : 'Latest episode'
    return {
      key: episode.id,
      show: getShow(episode.showId),
      art: artForEpisode(episode),
      kicker,
      title: episode.title,
      hostIds: episode.hostIds,
      action: locked
        ? { label: 'Join to watch', to: '/join', join: true }
        : { label: 'Play', to: `/watch/${episode.id}`, join: false },
    }
  })
})

const index = ref(0)
const current = computed(() => slides.value[index.value] ?? slides.value[0]!)
const paused = ref(false)
/** Paused by the viewer's own choice, not just while hovered or focused. */
const stopped = ref(false)
const muted = ref(true)

watch(isLive, () => (index.value = 0))

let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion) return
  timer = setInterval(() => {
    if (paused.value || stopped.value || slides.value.length < 2) return
    index.value = (index.value + 1) % slides.value.length
  }, ROTATE_MS)
})
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <section
    class="relative h-[68svh] max-h-[760px] min-h-[420px] w-full overflow-hidden"
    aria-label="Featured"
    @mouseenter="paused = true"
    @mouseleave="paused = false"
    @focusin="paused = true"
    @focusout="paused = false"
  >
    <Transition name="hero-fade">
      <!-- Live: the stream (a looping video here). Otherwise: the episode's painting. -->
      <HeroVideo v-if="current.key === 'live'" key="live" />
      <TitleCard v-else :key="current.key" :show="current.show" :art="current.art" :show-text="false" size="hero" />
    </Transition>

    <div class="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/40 to-transparent" />
    <div class="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink to-transparent" />

    <!-- Pitch mode labels. -->
    <div class="absolute top-4 left-4 z-20 flex flex-wrap gap-2 sm:left-8">
      <PitchNote id="hero-plays" />
      <PitchNote v-if="isLive" id="live-takeover" />
    </div>

    <!-- Live: sound control for the stream that is already playing. -->
    <button
      v-if="isLive"
      type="button"
      class="absolute top-4 right-4 flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium ring-1 ring-white/20 backdrop-blur hover:bg-black/70 sm:top-6 sm:right-8"
      :aria-pressed="!muted"
      @click="muted = !muted"
    >
      <AppIcon :name="muted ? 'volume-off' : 'volume-on'" />
      {{ muted ? 'Tap for sound' : 'Sound on' }}
    </button>

    <!-- Not live: countdown to the next show. -->
    <RouterLink
      v-else
      to="/live"
      class="absolute top-4 right-4 rounded-full bg-black/55 px-3 py-1.5 text-xs ring-1 ring-white/20 backdrop-blur hover:bg-black/70 sm:top-6 sm:right-8"
    >
      <span class="text-muted">Next live:</span>
      {{ getShow(event.showId).name }} in
      <span class="font-semibold tabular-nums">{{ countdown }}</span>
    </RouterLink>

    <div class="absolute inset-x-0 bottom-0 px-4 pb-10 sm:px-8 sm:pb-14">
      <div class="max-w-2xl">
        <p class="flex flex-wrap items-center gap-3 text-sm">
          <span
            v-if="isLive"
            class="inline-flex items-center gap-2 rounded bg-live px-2 py-0.5 text-xs font-bold tracking-wide uppercase"
          >
            <span class="size-2 animate-pulse rounded-full bg-white motion-reduce:animate-none" />
            Live now
          </span>
          <span v-else class="font-semibold tracking-wide text-accent-bright uppercase">
            {{ current.kicker }}
          </span>
          <span v-if="isLive" class="text-white/80"> {{ formatNumber(event.viewers) }} watching </span>
        </p>

        <p class="mt-3 font-serif text-sm font-bold tracking-widest text-white/70 uppercase">
          {{ current.show.name }}
        </p>
        <h2 class="mt-1 text-3xl leading-tight font-bold text-balance sm:text-5xl">
          {{ current.title }}
        </h2>
        <p class="mt-2 text-sm text-white/75 sm:text-base"><ContributorNames :ids="current.hostIds" /></p>

        <div class="mt-5 flex flex-wrap gap-3">
          <RouterLink
            :to="current.action.to"
            class="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition hover:brightness-110"
            :class="current.action.join ? 'bg-gold text-ink' : 'bg-white text-ink'"
          >
            <AppIcon :name="current.action.join ? 'lock' : 'play'" />
            {{ current.action.label }}
          </RouterLink>
          <RouterLink
            to="/shows"
            class="inline-flex items-center gap-2 rounded-lg bg-white/15 px-5 py-2.5 text-sm font-semibold backdrop-blur transition hover:bg-white/25"
          >
            <AppIcon name="info" />
            More from {{ current.show.name }}
          </RouterLink>
        </div>
      </div>
    </div>

    <div v-if="slides.length > 1" class="absolute right-4 bottom-10 flex items-center gap-2 sm:right-8 sm:bottom-14">
      <button
        type="button"
        class="mr-1 grid size-6 place-items-center rounded-full bg-black/40 text-white/85 ring-1 ring-white/20 hover:text-white [&>svg]:size-3.5"
        :aria-label="stopped ? 'Play the slideshow' : 'Pause the slideshow'"
        :aria-pressed="stopped"
        @click="stopped = !stopped"
      >
        <AppIcon :name="stopped ? 'play' : 'pause'" />
      </button>
      <button
        v-for="(slide, i) in slides"
        :key="slide.key"
        type="button"
        class="h-1.5 rounded-full transition-all"
        :class="i === index ? 'w-6 bg-white' : 'w-3 bg-white/40 hover:bg-white/70'"
        :aria-label="`Show featured item ${i + 1} of ${slides.length}`"
        :aria-current="i === index"
        @click="index = i"
      />
    </div>
  </section>
</template>

<style scoped>
.hero-fade-enter-active,
.hero-fade-leave-active {
  transition: opacity 0.9s ease;
}

.hero-fade-enter-from,
.hero-fade-leave-to {
  opacity: 0;
}
</style>
