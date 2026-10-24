<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AppIcon from './AppIcon.vue'
import type { Episode, Series } from '@/types/content'
import { toRoman } from '@/utils/format'

// Laid over the player when an episode ends: the next part with its
// countdown, the end of a series, or a thank-you. useUpNext runs the countdown.

defineProps<{
  /** The next part, if there is one and this viewer may watch it. */
  next?: Episode
  series?: Series
  counting: boolean
  secondsLeft: number
}>()
const emit = defineEmits<{ play: []; dismiss: [] }>()
</script>

<template>
  <div class="absolute inset-0 grid place-items-center bg-black/70 px-4 text-center" role="status">
    <div v-if="next">
      <p class="text-xs font-semibold tracking-widest text-accent-bright uppercase">Up next</p>
      <p class="mt-2 text-lg font-semibold sm:text-2xl">Part {{ toRoman(next.series!.part) }}: {{ next.title }}</p>
      <p v-if="counting" class="mt-1 text-sm text-white/75 tabular-nums">Playing in {{ secondsLeft }}s</p>
      <div class="mt-4 flex justify-center gap-2">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-ink"
          @click="emit('play')"
        >
          <AppIcon name="play" />
          Play now
        </button>
        <button
          type="button"
          class="rounded-lg bg-white/15 px-5 py-2.5 text-sm font-semibold hover:bg-white/25"
          @click="emit('dismiss')"
        >
          Cancel
        </button>
      </div>
    </div>
    <div v-else-if="series">
      <p class="text-lg font-semibold sm:text-2xl">You've finished {{ series.name }}</p>
      <RouterLink
        :to="`/series/${series.slug}`"
        class="mt-4 inline-block rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-ink"
      >
        Back to the series
      </RouterLink>
    </div>
    <div v-else>
      <p class="text-lg font-semibold sm:text-2xl">Thanks for watching</p>
      <button
        type="button"
        class="mt-4 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-ink"
        @click="emit('dismiss')"
      >
        Close
      </button>
    </div>
  </div>
</template>
