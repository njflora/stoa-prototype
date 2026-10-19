<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { artForShow, mediaUrl, type Artwork } from '@/data/media'
import type { Show } from '@/types/content'
import { hashString } from '@/utils/random'

// Artwork standing in for short preview clips. When animated, the painting
// drifts in a slow pan and zoom (a "Ken Burns" effect). Only transform
// animates, so the browser can run it on the GPU without repainting.

const props = withDefaults(
  defineProps<{
    show: Show
    /** The painting to show. Defaults to the show's first artwork. */
    art?: Artwork
    /** Small line under the show name, such as "#212" or a series part. */
    label?: string
    animated?: boolean
    /** Hide the text when the parent overlays its own, as the hero does. */
    showText?: boolean
    size?: 'card' | 'hero'
  }>(),
  { art: undefined, label: '', animated: true, showText: true, size: 'card' },
)

const root = ref<HTMLElement>()
const onScreen = ref(true)
let observer: IntersectionObserver | undefined

// Pause the animation while the card is scrolled out of view.
onMounted(() => {
  if (!root.value || !('IntersectionObserver' in window)) return
  observer = new IntersectionObserver(([entry]) => {
    onScreen.value = entry?.isIntersecting ?? true
  })
  observer.observe(root.value)
})
onUnmounted(() => observer?.disconnect())

const artwork = computed(() => props.art ?? artForShow(props.show.id)[0])

// Let the browser choose: the 640px card file for thumbnails, the 1280px
// file when the art fills a hero or player.
const srcset = computed(() =>
  artwork.value ? `${mediaUrl(artwork.value.card)} 640w, ${mediaUrl(artwork.value.hero)} 1280w` : undefined,
)
const sizes = computed(() => (props.size === 'hero' ? '100vw' : '(min-width: 640px) 288px, 240px'))

// Start each card at a different point in the pan, so a row of cards does
// not move in lockstep.
const delay = computed(() => `-${hashString(`${artwork.value?.id}${props.label}`) % 20}s`)

const base = computed(() => props.show.palette[1])
const tint = computed(() => props.show.palette[0])
</script>

<template>
  <div
    ref="root"
    class="title-card absolute inset-0 isolate overflow-hidden"
    :class="{ 'is-animated': animated, 'is-paused': !onScreen }"
    :style="{ backgroundColor: base }"
    aria-hidden="true"
  >
    <img
      v-if="artwork"
      :src="mediaUrl(size === 'hero' ? artwork.hero : artwork.card)"
      :srcset="srcset"
      :sizes="sizes"
      alt=""
      :loading="size === 'hero' ? 'eager' : 'lazy'"
      decoding="async"
      class="art absolute inset-0 size-full object-cover"
      :style="{ animationDelay: delay }"
    />
    <!-- A wash of the show's colour keeps each show recognisable. -->
    <div class="absolute inset-0 opacity-25 mix-blend-soft-light" :style="{ backgroundColor: tint }" />
    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/5" />

    <div v-if="showText" class="absolute inset-x-0 bottom-0" :class="size === 'hero' ? 'p-8' : 'p-3'">
      <p
        class="font-serif leading-tight font-bold text-white drop-shadow"
        :class="size === 'hero' ? 'text-5xl' : 'text-lg'"
      >
        {{ show.name }}
      </p>
      <p v-if="label" class="mt-0.5 truncate text-[11px] tracking-wide text-white/80 uppercase drop-shadow">
        {{ label }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.art {
  transform-origin: 50% 40%;
  will-change: transform;
}

.is-animated .art {
  animation: ken-burns 20s ease-in-out infinite alternate;
}

.is-paused .art {
  animation-play-state: paused;
}

@keyframes ken-burns {
  from {
    transform: scale(1.04) translate3d(0, 0, 0);
  }
  to {
    transform: scale(1.16) translate3d(-3%, -2%, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .title-card .art {
    animation: none !important;
  }
}
</style>
