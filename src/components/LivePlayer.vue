<script setup lang="ts">
import { computed, ref } from 'vue'
import HeroVideo from './HeroVideo.vue'
import PitchNote from './PitchNote.vue'
import { streamSources, type StreamSourceId } from '@/data/streams'
import type { Show } from '@/types/content'
import { formatNumber } from '@/utils/format'

// One consistent frame around every video source. The source switcher,
// title, viewer count and share sit outside the platform's iframe, so
// Rumble and Odysee feel like one product, and nothing here links off-site.
//
// Switching sources: the iframe is keyed by source, so Vue removes the old
// player and builds a fresh one on every switch. A third-party iframe
// cannot be paused from outside, so hiding it would leave its audio
// running; rebuilding it means a player is never left empty, which is the
// black-screen bug on the reference site.

const props = withDefaults(
  defineProps<{
    show: Show
    title: string
    mode?: 'live' | 'recording'
    viewers?: number
  }>(),
  { mode: 'live', viewers: 0 },
)

const sourceId = ref<StreamSourceId>('rumble')
const active = computed(() => streamSources.find((s) => s.id === sourceId.value)!)
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
        v-if="active.embedUrl"
        :key="active.id"
        :src="active.embedUrl"
        :title="`${title} on ${active.label}`"
        class="absolute inset-0 size-full"
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowfullscreen
        referrerpolicy="strict-origin-when-cross-origin"
      />
      <template v-else>
        <!-- Keyed by source, so switching rebuilds it, just like a real embed. -->
        <HeroVideo :key="active.id" button-class="right-3 bottom-3" />
        <div class="absolute inset-0 grid place-items-center px-4 text-center">
          <div>
            <p class="font-serif text-2xl font-bold sm:text-4xl">{{ show.name }}</p>
            <p class="mt-2 text-[11px] tracking-widest text-white/70 uppercase">
              Placeholder stream · {{ active.label }}
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
        <span v-else class="rounded bg-black/60 px-2 py-0.5 font-semibold tracking-wide uppercase">
          Recording
        </span>
        <span v-if="mode === 'live' && viewers" class="rounded bg-black/60 px-2 py-0.5">
          {{ formatNumber(viewers) }} watching
        </span>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-3 px-4 py-2 lg:px-0">
      <span class="text-xs text-muted" id="source-label">Source</span>
      <PitchNote id="player-switch" />
      <div class="inline-flex rounded-lg bg-surface p-1 ring-1 ring-white/10" role="group" aria-labelledby="source-label">
        <button
          v-for="source in streamSources"
          :key="source.id"
          type="button"
          class="rounded-md px-3 py-1 text-xs font-medium transition"
          :class="source.id === sourceId ? 'bg-accent text-white' : 'text-white/70 hover:text-white'"
          :aria-pressed="source.id === sourceId"
          @click="sourceId = source.id"
        >
          {{ source.label }}
        </button>
      </div>

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
