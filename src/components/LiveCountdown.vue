<script setup lang="ts">
import TitleCard from './TitleCard.vue'
import type { Show } from '@/types/content'

// Fills the video area before the show and during the break, so the page
// always shows what happens next and when.

defineProps<{
  show: Show
  /** Line above the countdown, such as "Starts in". */
  kicker: string
  countdown: string
  /** Line under the countdown, such as "Today at 13:00". */
  note?: string
}>()
</script>

<template>
  <div class="relative aspect-video w-full overflow-hidden bg-black lg:rounded-xl">
    <TitleCard :show="show" :show-text="false" size="hero" />
    <div class="absolute inset-0 bg-black/45" />
    <div class="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
      <p class="font-serif text-sm font-bold tracking-widest text-white/75 uppercase">{{ show.name }}</p>
      <p class="mt-3 text-sm text-white/85 sm:text-base">{{ kicker }}</p>
      <p
        class="mt-1 text-4xl font-bold tabular-nums sm:text-6xl"
        role="timer"
        aria-live="off"
      >
        {{ countdown }}
      </p>
      <p v-if="note" class="mt-2 text-xs text-white/70 sm:text-sm">{{ note }}</p>
      <div class="mt-4 flex flex-wrap justify-center gap-2">
        <slot />
      </div>
    </div>
  </div>
</template>
