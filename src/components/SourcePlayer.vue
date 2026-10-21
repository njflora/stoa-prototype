<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import HeroVideo from './HeroVideo.vue'
import PitchNote from './PitchNote.vue'
import { heroVideo, mediaUrl } from '@/data/media'
import { platformLabels, playableFor, type EpisodeSource, type Platform } from '@/data/streams'
import type { Show } from '@/types/content'
import { formatNumber } from '@/utils/format'

// One player for every stream: Rumble, Odysee, BitChute and the site's own
// video on demand (VOD). It offers only the platforms this episode is on,
// from its sources, and wraps each in the same frame. The source switch,
// title, viewer count and share sit outside the platform's iframe, so the
// platforms feel like one product, and nothing here links off-site.
//
// Switching sources: the player is keyed by platform, so Vue removes the
// old player and builds a fresh one on every switch. A third-party iframe
// cannot be paused from outside, so hiding it would leave its audio
// running; rebuilding it means a player is never left empty, which is the
// black-screen bug on the reference site.

const props = withDefaults(
  defineProps<{
    show: Show
    title: string
    /** Where it can be watched, from Laravel (episode_sources). */
    sources: EpisodeSource[]
    mode?: 'live' | 'recording' | 'episode'
    viewers?: number
  }>(),
  { mode: 'episode', viewers: 0 },
)

/** Ready to watch. Still processing shows greyed out; missing or failed links are left out. */
const linked = computed(() => props.sources.filter((s) => s.status === 'linked'))
const processing = computed(() => props.sources.filter((s) => s.status === 'pending'))

const platform = ref<Platform | undefined>(linked.value[0]?.platform)
// A new episode starts on its first platform.
watch(linked, (now) => {
  if (!now.some((s) => s.platform === platform.value)) platform.value = now[0]?.platform
})
const active = computed(() => linked.value.find((s) => s.platform === platform.value))
const playable = computed(() => (active.value ? playableFor(active.value) : { kind: 'placeholder' as const }))
const label = computed(() => (active.value ? platformLabels[active.value.platform] : ''))

// The live stream starts by itself, muted, unless reduced motion is on.
const autoplay = props.mode === 'live' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches

const copied = ref(false)
async function share() {
  const url = window.location.href
  try {
    if (navigator.share) {
      await navigator.share({ title: props.title, url })
      return
    }
    await navigator.clipboard.writeText(url)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    // Share sheet dismissed or clipboard blocked: nothing to do.
  }
}
</script>

<template>
  <div>
    <div class="relative aspect-video w-full overflow-hidden bg-black lg:rounded-xl">
      <iframe
        v-if="playable.kind === 'iframe'"
        :key="`iframe-${platform}`"
        :src="playable.url"
        :title="`${title} on ${label}`"
        class="absolute inset-0 size-full"
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowfullscreen
        referrerpolicy="strict-origin-when-cross-origin"
      />
      <!-- The site's own player: a plain video element, no third party. -->
      <video
        v-else-if="playable.kind === 'video'"
        :key="`video-${platform}`"
        class="absolute inset-0 size-full object-cover"
        :poster="mediaUrl(heroVideo.poster)"
        controls
        playsinline
        :autoplay="autoplay"
        :muted="autoplay"
        :loop="mode === 'live'"
        :aria-label="`${title}, on ${label}`"
      >
        <source v-for="file in playable.sources" :key="file.src" :src="file.src" :type="file.type" />
      </video>
      <template v-else>
        <!-- Keyed by platform, so switching rebuilds it, just like a real embed. -->
        <div :key="`placeholder-${platform}`" class="absolute inset-0">
          <slot name="placeholder">
            <HeroVideo button-class="right-3 bottom-3" />
          </slot>
        </div>
        <!-- Nothing to say until the sources have loaded. -->
        <div v-if="sources.length" class="absolute inset-0 grid place-items-center px-4 text-center">
          <div>
            <p class="font-serif text-2xl font-bold sm:text-4xl">{{ show.name }}</p>
            <p class="mt-2 text-[11px] tracking-widest text-white/70 uppercase">
              {{ active ? `Placeholder ${mode === 'live' ? 'stream' : 'video'} · ${label}` : 'Not available to watch yet' }}
            </p>
          </div>
        </div>
      </template>

      <div class="pointer-events-none absolute top-3 left-3 flex items-center gap-2 text-xs">
        <span
          v-if="mode === 'live'"
          class="inline-flex items-center gap-1.5 rounded bg-live px-2 py-0.5 font-bold tracking-wide uppercase"
        >
          <span class="size-1.5 animate-pulse rounded-full bg-white motion-reduce:animate-none" />
          Live
        </span>
        <span v-else-if="mode === 'recording'" class="rounded bg-black/60 px-2 py-0.5 font-semibold tracking-wide uppercase">
          Recording
        </span>
        <span v-if="mode === 'live' && viewers" class="rounded bg-black/60 px-2 py-0.5">
          {{ formatNumber(viewers) }} watching
        </span>
      </div>

      <!-- Anything the page lays over the player, such as "Up next". -->
      <slot name="overlay" />
    </div>

    <div class="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2 lg:px-0">
      <span id="source-label" class="text-xs text-muted">Watch on</span>
      <div class="inline-flex flex-wrap rounded-lg bg-surface p-1 ring-1 ring-white/10" role="group" aria-labelledby="source-label">
        <button
          v-for="source in linked"
          :key="source.platform"
          type="button"
          class="rounded-md px-3 py-1 text-xs font-medium transition"
          :class="source.platform === platform ? 'bg-accent text-white' : 'text-white/70 hover:text-white'"
          :aria-pressed="source.platform === platform"
          @click="platform = source.platform"
        >
          {{ platformLabels[source.platform] }}
        </button>
        <span
          v-for="source in processing"
          :key="source.platform"
          class="px-3 py-1 text-xs text-white/35"
          :title="`Still processing on ${platformLabels[source.platform]}`"
        >
          {{ platformLabels[source.platform] }} <span class="sr-only">(still processing)</span>
        </span>
      </div>
      <PitchNote id="every-stream" />
      <PitchNote id="player-switch" />

      <button
        type="button"
        class="ml-auto rounded-lg bg-surface px-3 py-1.5 text-xs font-medium ring-1 ring-white/10 hover:bg-raised"
        @click="share"
      >
        {{ copied ? 'Link copied' : 'Share' }}
      </button>
    </div>
  </div>
</template>
