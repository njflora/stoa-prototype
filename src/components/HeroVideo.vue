<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import AppIcon from './AppIcon.vue'
import { heroVideo, mediaUrl } from '@/data/media'

// A short, muted, looping background video (CC0, see CREDITS.md).
// - It starts itself rather than using the autoplay attribute, so it can
//   respect "reduce motion": with that setting on, only the still poster shows.
// - It has a visible pause button: moving content longer than five seconds
//   must be pausable (WCAG 2.2.2).
// - It pauses while scrolled out of view, and stays paused if the viewer
//   paused it.

withDefaults(
  defineProps<{
    /** Where to place the pause button. */
    buttonClass?: string
  }>(),
  { buttonClass: 'right-4 bottom-4 sm:right-8 sm:bottom-6' },
)

const video = ref<HTMLVideoElement>()
const playing = ref(false)
const pausedByViewer = ref(false)
let observer: IntersectionObserver | undefined

async function play() {
  try {
    await video.value?.play()
  } catch {
    // The browser refused to play (for example, a power-saving mode).
    // The poster stays, and the button lets the viewer try again.
  }
}

function toggle() {
  if (playing.value) {
    video.value?.pause()
    pausedByViewer.value = true
  } else {
    pausedByViewer.value = false
    void play()
  }
}

onMounted(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion) pausedByViewer.value = true
  else void play()

  if (!video.value || !('IntersectionObserver' in window)) return
  observer = new IntersectionObserver(([entry]) => {
    if (!entry?.isIntersecting) video.value?.pause()
    else if (!pausedByViewer.value) void play()
  })
  observer.observe(video.value)
})
onUnmounted(() => observer?.disconnect())
</script>

<template>
  <div class="absolute inset-0 overflow-hidden bg-black">
    <video
      ref="video"
      muted
      loop
      playsinline
      preload="metadata"
      :poster="mediaUrl(heroVideo.poster)"
      class="size-full object-cover"
      aria-hidden="true"
      tabindex="-1"
      @play="playing = true"
      @pause="playing = false"
    >
      <source :src="mediaUrl(heroVideo.webm)" type="video/webm" />
      <source :src="mediaUrl(heroVideo.mov)" type="video/quicktime" />
    </video>
    <button
      type="button"
      class="absolute z-10 grid size-9 place-items-center rounded-full bg-black/55 ring-1 ring-white/20 backdrop-blur hover:bg-black/70 [&>svg]:size-4"
      :class="buttonClass"
      :aria-label="playing ? 'Pause background video' : 'Play background video'"
      @click="toggle"
    >
      <AppIcon :name="playing ? 'pause' : 'play'" />
    </button>
  </div>
</template>
