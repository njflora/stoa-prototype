<script setup lang="ts">
import AppIcon from './AppIcon.vue'
import { usePreviewSound } from '@/composables/usePreview'

// Mute or unmute hover previews, as on YouTube. One setting for every card:
// unmute once and every preview plays with sound. The demo has no audio, so
// this shows the control rather than playing anything.
// It sits beside the card's link, not inside it: a button inside a link is
// invalid, and a click would open the episode.

const { muted, toggle } = usePreviewSound()
</script>

<template>
  <button
    type="button"
    class="absolute top-1.5 right-1.5 z-20 grid size-8 place-items-center rounded-full bg-black/65 ring-1 ring-white/25 backdrop-blur transition hover:bg-black/85 [&>svg]:size-4"
    :aria-pressed="!muted"
    :aria-label="muted ? 'Unmute previews' : 'Mute previews'"
    :title="muted ? 'Unmute' : 'Mute'"
    @click="toggle"
  >
    <AppIcon :name="muted ? 'volume-off' : 'volume-on'" />
  </button>
</template>
