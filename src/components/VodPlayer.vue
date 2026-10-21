<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import type { Rendition } from '@/data/streams'
import { releaseClock, reportClock, usePlayerRequests } from '@/composables/usePlayerClock'

// The site's own video player, for its own hosting (VOD). Custom controls in
// the site's skin, after the reference site's player: a pink progress bar
// with a round handle, then pause, volume, a red LIVE dot (or the time),
// settings (quality and speed) and full screen. The controls fade out while
// playing, and come back on any movement, tap or keyboard focus.

const props = defineProps<{
  /** The video's sizes, "Auto" first. */
  renditions: Rendition[]
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

// ---------- settings: quality and speed ----------
// Quality: the sizes this browser can play. Choosing one swaps the file and carries
// on from the same moment, at the same speed. With real hosting the sizes
// would come from the HLS stream, and "Auto" would follow the connection.
const probe = document.createElement('video')
const canPlay = (rendition: Rendition) => rendition.files.some((file) => probe.canPlayType(file.type) !== '')
const qualities = computed(() => props.renditions.filter(canPlay).map((r) => r.label))
const quality = ref('Auto')
const files = computed(() => (props.renditions.find((r) => r.label === quality.value) ?? props.renditions[0])?.files ?? [])
/** Where to pick up after a switch. */
let resumeAt: { time: number; play: boolean } | null = null
// Speed: a live stream plays in real time, so it has no speed setting.
const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2]
const speed = ref(1)
const speedName = (rate: number) => (rate === 1 ? 'Normal' : `${rate}×`)

const settingsOpen = ref(false)
const view = ref<'main' | 'quality' | 'speed'>('main')
const settingsButton = ref<HTMLButtonElement>()
const panel = ref<HTMLElement>()

async function openView(next: typeof view.value) {
  view.value = next
  await nextTick()
  panel.value?.querySelector<HTMLElement>('button, input')?.focus()
}
function toggleSettings() {
  settingsOpen.value = !settingsOpen.value
  if (settingsOpen.value) openView('main')
}
function closeSettings() {
  settingsOpen.value = false
  settingsButton.value?.focus()
}
function setSpeed(rate: number) {
  speed.value = Math.round(rate * 100) / 100
  if (video.value) video.value.playbackRate = speed.value
}
async function chooseQuality(choice: string) {
  if (choice !== quality.value && video.value) {
    resumeAt = { time: video.value.currentTime, play: !video.value.paused }
    quality.value = choice
    await nextTick()
    video.value.load()
  }
  openView('main')
}
/** After a new file loads: the same moment, the same speed, and playing if it was. */
function onLoaded() {
  const v = video.value!
  duration.value = v.duration
  v.playbackRate = speed.value
  report()
  if (resumeAt) {
    v.currentTime = Math.min(resumeAt.time, v.duration || resumeAt.time)
    if (resumeAt.play) v.play().catch(() => {})
    resumeAt = null
  }
}
function chooseSpeed(rate: number) {
  setSpeed(rate)
  openView('main')
}

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
    if (playing.value && !settingsOpen.value && !root.value?.contains(document.activeElement)) shown.value = false
  }, 2500)
}

const onFullscreenChange = () => (fullscreen.value = document.fullscreenElement === root.value)
onMounted(() => document.addEventListener('fullscreenchange', onFullscreenChange))
// A recording shares its time, pause and speed, so the chat replay can follow it.
function report() {
  if (!props.live && video.value) reportClock(video.value)
}
onMounted(report)
// Requests from the chat replay: seek (stopping at the end) and play or pause.
const requests = usePlayerRequests()
watch(
  () => requests.seek.n,
  () => {
    const v = video.value
    if (!v || props.live) return
    v.currentTime = Math.min(requests.seek.to, v.duration || 0)
  },
)
watch(
  () => requests.play.n,
  () => {
    const v = video.value
    if (!v || props.live) return
    if (requests.play.on) v.play().catch(() => {})
    else v.pause()
  },
)
onUnmounted(() => {
  if (!props.live) releaseClock()
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
      @click="settingsOpen ? (settingsOpen = false) : toggle()"
      @play="(playing = true), wake(), report()"
      @pause="(playing = false), (shown = true), report()"
      @volumechange="muted = video!.muted"
      @timeupdate="(current = video!.currentTime), report()"
      @seeking="report"
      @ratechange="report"
      @loadedmetadata="onLoaded"
    >
      <source v-for="file in files" :key="file.src" :src="file.src" :type="file.type" />
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

    <!-- Settings: quality and speed, one level at a time. Escape closes it. -->
    <div
      v-if="settingsOpen"
      ref="panel"
      role="group"
      aria-label="Player settings"
      class="absolute right-2 bottom-16 z-10 max-h-[calc(100%-5rem)] w-56 overflow-y-auto rounded-lg bg-ink/95 p-1 text-sm shadow-2xl ring-1 ring-white/10 backdrop-blur sm:right-3"
      @keydown.esc.stop="closeSettings"
      @pointerdown.stop
    >
      <template v-if="view === 'main'">
        <button type="button" class="flex w-full items-center justify-between rounded-md px-3 py-2 hover:bg-white/10" @click="openView('quality')">
          Quality <span class="flex items-center gap-1 text-white/70">{{ quality }}<AppIcon name="chevron-right" class="size-4" /></span>
        </button>
        <button v-if="!live" type="button" class="flex w-full items-center justify-between rounded-md px-3 py-2 hover:bg-white/10" @click="openView('speed')">
          Speed <span class="flex items-center gap-1 text-white/70">{{ speedName(speed) }}<AppIcon name="chevron-right" class="size-4" /></span>
        </button>
      </template>

      <template v-else>
        <button type="button" class="flex w-full items-center gap-1 rounded-md px-2 py-2 font-semibold hover:bg-white/10" @click="openView('main')">
          <AppIcon name="chevron-left" class="size-4" /> {{ view === 'quality' ? 'Quality' : 'Speed' }}
        </button>
        <div class="my-1 border-t border-white/10" />
        <template v-if="view === 'quality'">
          <button
            v-for="choice in qualities"
            :key="choice"
            type="button"
            class="flex w-full items-center justify-between rounded-md px-3 py-1.5 hover:bg-white/10"
            :class="choice === quality ? 'text-accent-bright' : ''"
            :aria-pressed="choice === quality"
            @click="chooseQuality(choice)"
          >
            {{ choice }}<AppIcon v-if="choice === quality" name="check" class="size-4" />
          </button>
        </template>
        <template v-else>
          <button
            v-for="rate in speeds"
            :key="rate"
            type="button"
            class="flex w-full items-center justify-between rounded-md px-3 py-1.5 hover:bg-white/10"
            :class="rate === speed ? 'text-accent-bright' : ''"
            :aria-pressed="rate === speed"
            @click="chooseSpeed(rate)"
          >
            {{ speedName(rate) }}<AppIcon v-if="rate === speed" name="check" class="size-4" />
          </button>
          <!-- Any speed from 0.25 to 3 times. -->
          <label class="block px-3 pt-2 pb-1.5">
            <span class="flex justify-between text-xs text-white/70">
              Custom <span class="font-semibold text-white tabular-nums" :class="speeds.includes(speed) ? '' : 'text-accent-bright'">{{ speed }}×</span>
            </span>
            <input
              type="range"
              min="0.25"
              max="3"
              step="0.05"
              :value="speed"
              class="mt-1.5 w-full accent-[var(--color-accent-bright)]"
              aria-label="Custom speed"
              :aria-valuetext="`${speed} times`"
              @input="setSpeed(Number(($event.target as HTMLInputElement).value))"
            />
          </label>
        </template>
      </template>
    </div>

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
        <button
          ref="settingsButton"
          type="button"
          class="ml-auto"
          aria-label="Settings"
          aria-haspopup="true"
          :aria-expanded="settingsOpen"
          @click="toggleSettings"
        >
          <AppIcon name="settings" class="transition" :class="settingsOpen ? 'rotate-45 text-accent-bright' : ''" />
        </button>
        <button type="button" :aria-label="fullscreen ? 'Exit full screen' : 'Full screen'" @click="toggleFullscreen">
          <AppIcon :name="fullscreen ? 'fullscreen-exit' : 'fullscreen'" />
        </button>
      </div>
    </div>
  </div>
</template>
