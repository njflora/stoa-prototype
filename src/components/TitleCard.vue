<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { Show } from '@/types/content'

// Generated title art standing in for short preview clips. When animated,
// light drifts across the card. Only transform and opacity animate, so
// the browser can run it on the GPU without repainting the page.

const props = withDefaults(
  defineProps<{
    show: Show
    /** Small line under the show name, such as "#1431" or a series part. */
    label?: string
    animated?: boolean
    /** Hide the text when the parent overlays its own, as the hero does. */
    showText?: boolean
    size?: 'card' | 'hero'
  }>(),
  { label: '', animated: true, showText: true, size: 'card' },
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

const glow = computed(() => props.show.palette[0])
const base = computed(() => props.show.palette[1])
const highlight = computed(() => props.show.palette[2])
</script>

<template>
  <div
    ref="root"
    class="title-card absolute inset-0 isolate overflow-hidden"
    :class="{ 'is-animated': animated, 'is-paused': !onScreen, 'is-hero': size === 'hero' }"
    :style="{ backgroundColor: base }"
    aria-hidden="true"
  >
    <div
      class="orb orb-a"
      :style="{ background: `radial-gradient(circle at center, ${glow} 0%, transparent 62%)` }"
    />
    <div
      class="orb orb-b"
      :style="{ background: `radial-gradient(circle at center, ${highlight} 0%, transparent 58%)` }"
    />
    <div class="sheen" />
    <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

    <div v-if="showText" class="absolute inset-x-0 bottom-0" :class="size === 'hero' ? 'p-8' : 'p-3'">
      <p
        class="font-serif leading-tight font-bold text-white drop-shadow"
        :class="size === 'hero' ? 'text-5xl' : 'text-lg'"
      >
        {{ show.name }}
      </p>
      <p v-if="label" class="mt-0.5 truncate text-[11px] tracking-wide text-white/75 uppercase">
        {{ label }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.orb {
  position: absolute;
  width: 95%;
  aspect-ratio: 1;
  opacity: 0.85;
  will-change: transform;
}

.orb-a {
  top: -45%;
  left: -25%;
}

.orb-b {
  right: -30%;
  bottom: -60%;
  opacity: 0.45;
}

/* The hero keeps its text on the left, so its light sits to the right. */
.is-hero .orb-a,
.is-hero .orb-b {
  width: auto;
  height: 130%;
}

.is-hero .orb-a {
  top: -45%;
  left: 25%;
}

.is-hero .orb-b {
  right: -25%;
  bottom: -75%;
}

/* On narrow screens, keep the light within the frame. */
@media (max-width: 640px) {
  .is-hero .orb-a {
    left: -55%;
    top: -35%;
  }
}

/* A soft diagonal band of light that sweeps across the card. */
.sheen {
  position: absolute;
  inset: -50% auto -50% 0;
  width: 40%;
  background: linear-gradient(90deg, transparent, rgb(255 255 255 / 0.14), transparent);
  transform: translateX(-150%) rotate(18deg);
  opacity: 0;
}

.is-animated .orb-a {
  animation: drift 9s ease-in-out infinite;
}

.is-animated .orb-b {
  animation: drift-alt 13s ease-in-out infinite;
}

.is-animated .sheen {
  opacity: 1;
  animation: sweep 6s ease-in-out infinite;
}

.is-paused * {
  animation-play-state: paused !important;
}

@keyframes drift {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(35%, 22%, 0) scale(1.2);
  }
}

@keyframes drift-alt {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1.1);
  }
  50% {
    transform: translate3d(-30%, -25%, 0) scale(0.9);
  }
}

@keyframes sweep {
  0% {
    transform: translateX(-150%) rotate(18deg);
  }
  60%,
  100% {
    transform: translateX(400%) rotate(18deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .title-card * {
    animation: none !important;
  }
}
</style>
