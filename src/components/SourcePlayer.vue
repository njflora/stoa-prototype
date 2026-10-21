<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, useId, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import HeroVideo from './HeroVideo.vue'
import PitchNote from './PitchNote.vue'
import VodPlayer from './VodPlayer.vue'
import { heroVideo, mediaUrl } from '@/data/media'
import { platformLabels, playableFor, type EpisodeSource, type Platform } from '@/data/streams'
import type { Show } from '@/types/content'
import { formatNumber } from '@/utils/format'

// One player for every stream: Rumble, Odysee, BitChute and the site's own
// video on demand (VOD). It offers only the platforms this episode is on,
// from its sources, and wraps each in the same frame. The source picker,
// title, viewer count and share sit outside the platform's iframe, so the
// platforms feel like one product, and nothing here links off-site. The
// styling follows the reference site's player: outlined pink buttons under
// the video ("Change player source"), and its own video's controls in pink.
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

// "Change player source": a small menu of this episode's platforms.
const menuId = useId()
const menuOpen = ref(false)
const pill = ref<HTMLButtonElement>()
const menu = ref<HTMLElement>()
const canChange = computed(() => linked.value.length + processing.value.length > 1)

async function openMenu() {
  menuOpen.value = true
  await nextTick()
  menu.value?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus()
  document.addEventListener('pointerdown', closeOutside)
}
function closeMenu(returnFocus = true) {
  menuOpen.value = false
  document.removeEventListener('pointerdown', closeOutside)
  if (returnFocus) pill.value?.focus()
}
function closeOutside(event: PointerEvent) {
  const target = event.target as Node
  if (!menu.value?.contains(target) && !pill.value?.contains(target)) closeMenu(false)
}
function choose(next: Platform) {
  platform.value = next
  closeMenu()
}
/** Up and down move between the platforms; Escape and Tab close the menu. */
function onMenuKeydown(event: KeyboardEvent) {
  const items = [...(menu.value?.querySelectorAll<HTMLElement>('[role="menuitemradio"]:not([aria-disabled="true"])') ?? [])]
  const at = items.indexOf(document.activeElement as HTMLElement)
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    const step = event.key === 'ArrowDown' ? 1 : -1
    items[(at + step + items.length) % items.length]?.focus()
  } else if (event.key === 'Escape') {
    closeMenu()
  } else if (event.key === 'Tab') {
    closeMenu(false)
  }
}
onUnmounted(() => document.removeEventListener('pointerdown', closeOutside))

const pillClass =
  'inline-flex min-h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold text-accent-bright ring-1 ring-accent-bright/80 transition hover:bg-accent-bright/10 [&>svg]:size-4'

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
    <div class="relative aspect-video w-full overflow-hidden bg-black lg:rounded-xl lg:ring-1 lg:ring-white/10">
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
      <!-- The site's own player: its own video, no third party, in the site's skin. -->
      <VodPlayer
        v-else-if="playable.kind === 'video'"
        :key="`video-${platform}`"
        :sources="playable.sources"
        :poster="mediaUrl(heroVideo.poster)"
        :label="`${title}, on ${label}`"
        :live="mode === 'live'"
        :autoplay="autoplay"
      />
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

    <div class="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 lg:px-0">
      <p v-if="active" class="text-xs text-muted">Playing on <span class="font-semibold text-white">{{ label }}</span></p>

      <div v-if="canChange" class="relative">
        <button
          ref="pill"
          type="button"
          :class="pillClass"
          aria-haspopup="menu"
          :aria-expanded="menuOpen"
          :aria-controls="menuId"
          @click="menuOpen ? closeMenu() : openMenu()"
        >
          <AppIcon name="film" />
          Change player source
          <AppIcon name="chevron-right" class="transition" :class="menuOpen ? 'rotate-90' : ''" />
        </button>
        <ul
          v-if="menuOpen"
          :id="menuId"
          ref="menu"
          role="menu"
          aria-label="Player source"
          class="absolute top-full left-0 z-30 mt-1.5 w-56 rounded-lg bg-raised p-1 shadow-2xl ring-1 ring-white/10"
          @keydown="onMenuKeydown"
        >
          <li v-for="source in linked" :key="source.platform" role="none">
            <button
              type="button"
              role="menuitemradio"
              :aria-checked="source.platform === platform"
              class="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-white/10 focus-visible:bg-white/10"
              :class="source.platform === platform ? 'text-accent-bright' : 'text-white'"
              @click="choose(source.platform)"
            >
              {{ platformLabels[source.platform] }}
              <AppIcon v-if="source.platform === platform" name="check" class="size-4" />
            </button>
          </li>
          <li v-for="source in processing" :key="source.platform" role="none">
            <span role="menuitemradio" aria-checked="false" aria-disabled="true" class="flex w-full items-center justify-between px-3 py-2 text-sm text-white/40">
              {{ platformLabels[source.platform] }}
              <span class="text-xs">Processing</span>
            </span>
          </li>
        </ul>
      </div>

      <PitchNote id="every-stream" />
      <PitchNote id="player-switch" />

      <button type="button" class="ml-auto" :class="pillClass" @click="share">
        {{ copied ? 'Link copied' : 'Share' }}
      </button>
    </div>
  </div>
</template>
