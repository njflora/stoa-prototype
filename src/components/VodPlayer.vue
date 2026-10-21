<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import AppIcon from './AppIcon.vue'

// The site's own video player, for its own hosting (VOD). Custom controls in
// the site's skin, after the reference site's player: a pink progress bar
// with a round handle, then pause, volume, a red LIVE dot (or the time) and
// full screen. The controls fade out while playing, and come back on any
// movement, tap or keyboard focus.

const props = defineProps<{
  /** The same video in more than one format; the browser plays the first it can. */
  sources: { src: string; type: string }[]
  poster?: string
  /** What is playing, for screen readers. */
  label: string
  /** A live stream: no seeking, and a LIVE dot instead of the time. */
  live?: boolean
  /** Start by itself, muted, as browsers require. */
  autoplay?: boolean
}>()

const root = ref<HTMLElement>()
const video = ref<HTMLVideoElement>()
const playing = ref(false)
const muted = ref(Boolean(props.autoplay))
const current = ref(0)
const duration = ref(0)
const fullscreen = ref(false)
const shown = ref(true)
let hideTimer: ReturnType<typeof setTimeout> | undefined

const progress = computed(() => (props.live ? 100 : duration.value ? (current.value / duration.value) * 100 : 0))
const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`

function toggle() {
  const v = video.value
  if (!v) return
  if (v.paused) v.play().catch(() => {})
  else v.pause()
}

function toggleMute() {
  if (video.value) video.value.muted = !video.value.muted
}

function seek(event: Event) {
  if (video.value) video.value.currentTime = Number((event.target as HTMLInputElement).value)
}

/** Full screen for the whole player, so the controls come too; iPhones only allow the video itself. */
function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {})
    return
  }
  const element = root.value
  const iosVideo = video.value as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | undefined
  if (element?.requestFullscreen) element.requestFullscreen().catch(() => {})
  else iosVideo?.webkitEnterFullscreen?.()
}

/** Show the controls, then hide them again after a while if the video is playing. */
function wake() {
  shown.value = true
  clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    if (playing.value && !root.value?.contains(document.activeElement)) shown.value = false
  }, 2500)
}

const onFullscreenChange = () => (fullscreen.value = document.fullscreenElement === root.value)
onMounted(() => document.addEventListener('fullscreenchange', onFullscreenChange))
onUnmounted(() => {
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  clearTimeout(hideTimer)
})
</script>

<template>
  <div
    ref="root"
    class="group absolute inset-0 bg-black"
    :class="shown || !playing ? '' : 'cursor-none'"
    @pointermove="wake"
    @pointerdown="wake"
    @focusin="wake"
  >
    <video
      ref="video"
      class="size-full object-cover"
      :poster="poster"
      playsinline
      :autoplay="autoplay"
      :muted="autoplay"
      :loop="live"
      :aria-label="label"
      @click="toggle"
      @play="(playing = true), wake()"
      @pause="(playing = false), (shown = true)"
      @volumechange="muted = video!.muted"
      @timeupdate="current = video!.currentTime"
      @loadedmetadata="duration = video!.duration"
    >
      <source v-for="file in sources" :key="file.src" :src="file.src" :type="file.type" />
    </video>

    <!-- Paused: one big button in the middle. -->
    <button
      v-if="!playing"
      type="button"
      class="absolute top-1/2 left-1/2 grid size-16 -translate-1/2 place-items-center rounded-full bg-black/50 ring-2 ring-white/70 transition hover:bg-accent/80 [&>svg]:size-7"
      aria-label="Play"
      @click="toggle"
    >
      <AppIcon name="play" />
    </button>

    <div
      class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-3 pt-8 pb-2 transition-opacity duration-300 sm:px-4"
      :class="shown || !playing ? 'opacity-100' : 'pointer-events-none opacity-0'"
    >
      <!-- Progress: pink, with a round handle. A live stream is always at the end. -->
      <!-- The slider itself is invisible, so its keyboard focus shows on this row. -->
      <div class="relative flex h-4 items-center rounded has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-white">
        <div class="h-1 w-full rounded-full bg-white/25">
          <div class="h-full rounded-full bg-accent-bright" :style="{ width: `${progress}%` }" />
        </div>
        <span
          class="pointer-events-none absolute size-3 -translate-x-1/2 rounded-full bg-accent-bright shadow ring-2 ring-white/80"
          :style="{ left: `${progress}%` }"
        />
        <input
          v-if="!live"
          type="range"
          class="absolute inset-0 w-full cursor-pointer opacity-0"
          min="0"
          :max="duration || 0"
          step="0.1"
          :value="current"
          aria-label="Seek"
          :aria-valuetext="`${clock(current)} of ${clock(duration)}`"
          @input="seek"
        />
      </div>

      <div class="mt-1 flex items-center gap-1 text-white [&_button]:grid [&_button]:size-9 [&_button]:place-items-center [&_button]:rounded-md [&_button]:transition [&_button:hover]:text-accent-bright [&_svg]:size-5">
        <button type="button" :aria-label="playing ? 'Pause' : 'Play'" @click="toggle">
          <AppIcon :name="playing ? 'pause' : 'play'" />
        </button>
        <button type="button" :aria-label="muted ? 'Unmute' : 'Mute'" @click="toggleMute">
          <AppIcon :name="muted ? 'volume-off' : 'volume-on'" />
        </button>
        <span v-if="live" class="ml-1 inline-flex items-center gap-1.5 text-xs font-bold tracking-wide">
          <span class="size-1.5 rounded-full bg-live" aria-hidden="true" />
          LIVE
        </span>
        <span v-else class="ml-1 text-xs text-white/85 tabular-nums">{{ clock(current) }} / {{ clock(duration) }}</span>
        <button type="button" class="ml-auto" :aria-label="fullscreen ? 'Exit full screen' : 'Full screen'" @click="toggleFullscreen">
          <AppIcon :name="fullscreen ? 'fullscreen-exit' : 'fullscreen'" />
        </button>
      </div>
    </div>
  </div>
</template>
