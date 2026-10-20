<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, useId, watch } from 'vue'
import PitchNote from './PitchNote.vue'
import { useIntro } from '@/composables/useIntro'

// The welcome: a stoa of purple arches in a modern, vaporwave style, under a
// striped sunset and over a neon grid. It covers the whole screen until the
// visitor breaks the purple wax seal (a real button). Then the seal falls
// away, the arches flare, and the view moves through the central arch,
// down the colonnade, into the site, which has been loading behind.
// - Keyboard: the seal has focus; Enter or Space opens it, Escape skips.
// - "Reduce motion": nothing falls, flares or moves, just a short fade.
// - While open, the page behind is inert, so focus cannot wander into it.
// Plain inline SVG and CSS: nothing to download.

const { open, finish } = useIntro()

const OPEN_MS = 2000
const FADE_MS = 300

const phase = ref<'idle' | 'opening'>('idle')
const reduced = ref(false)
const seal = ref<HTMLButtonElement>()
let timer: ReturnType<typeof setTimeout> | undefined

const uid = useId()
const id = (name: string) => `${uid}-${name}`

function enter() {
  if (phase.value === 'opening') return
  reduced.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  phase.value = 'opening'
  timer = setTimeout(done, reduced.value ? FADE_MS : OPEN_MS)
}

function done() {
  clearTimeout(timer)
  phase.value = 'idle'
  finish()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') done()
}

// While open: the page behind cannot scroll or take focus. Afterwards,
// focus moves to the page's main content.
watch(
  open,
  async (isOpen) => {
    const app = document.getElementById('app')
    document.documentElement.style.overflow = isOpen ? 'hidden' : ''
    if (app) app.inert = isOpen
    if (isOpen) {
      phase.value = 'idle'
      await nextTick()
      seal.value?.focus()
      document.addEventListener('keydown', onKeydown)
    } else {
      document.removeEventListener('keydown', onKeydown)
      await nextTick()
      const main = document.querySelector<HTMLElement>('#app main')
      if (main) {
        main.tabIndex = -1
        main.focus({ preventScroll: true })
      }
    }
  },
  { immediate: true },
)

// The scene is drawn in a 1200 by 800 box and fills the screen, cropping the
// sides on tall phones (preserveAspectRatio "slice"). The seal button is
// placed over the same point, so it is worked out from the screen size.
const W = 1200
const H = 800
const SEAL = { x: 600, y: 468 }
const screen = ref({ w: window.innerWidth, h: window.innerHeight })
function measure() {
  screen.value = { w: window.innerWidth, h: window.innerHeight }
}
onMounted(() => window.addEventListener('resize', measure))
onUnmounted(() => {
  window.removeEventListener('resize', measure)
  clearTimeout(timer)
  document.removeEventListener('keydown', onKeydown)
})
const placement = computed(() => {
  const scale = Math.max(screen.value.w / W, screen.value.h / H)
  const x = (screen.value.w - W * scale) / 2 + SEAL.x * scale
  const y = (screen.value.h - H * scale) / 2 + SEAL.y * scale
  return { x, y, size: Math.max(56, 118 * scale) }
})

// ---------- the drawing ----------
const HORIZON = 520
const BASE = 600 // where the arcade stands

/** An arch-shaped outline: up the left side, over the semicircle, down the right. */
function arch(cx: number, width: number, spring: number, bottom: number) {
  const r = width / 2
  return `M${cx - r},${bottom} V${spring} A${r},${r} 0 0 1 ${cx + r},${spring} V${bottom}`
}

// A Roman arcade under a Greek pediment: wide piers faced with pilasters
// (each with a capital and a base), semicircular arches with an archivolt,
// an impost where each arch springs and a keystone at the top, and a full
// entablature (architrave, frieze, cornice) carrying the pediment.
const WALL_TOP = 300
const pilasters = [130, 260, 480, 720, 940, 1070]
const PILASTER = 34
// The five openings, one per bay: a large central arch flanked by smaller ones.
const openings = [
  { cx: 195, w: 70, spring: 480 },
  { cx: 370, w: 140, spring: 448 },
  { cx: 600, w: 168, spring: 420 },
  { cx: 830, w: 140, spring: 448 },
  { cx: 1005, w: 70, spring: 480 },
]
// The wall with the openings cut out of it (evenodd fill).
const facade = `M108,${WALL_TOP} H1092 V${BASE} H108 Z ` + openings.map((o) => `${arch(o.cx, o.w, o.spring, BASE)} Z`).join(' ')
/** The moulded band around an arch, just outside the opening. */
function archivolt(o: { cx: number; w: number; spring: number }) {
  const r = o.w / 2 + 11
  return `M${o.cx - r},${o.spring} A${r},${r} 0 0 1 ${o.cx + r},${o.spring}`
}
/** The wedge-shaped stone at the top of an arch. */
function keystone(o: { cx: number; w: number; spring: number }) {
  const top = o.spring - o.w / 2
  return `${o.cx - 9},${top - 16} ${o.cx + 9},${top - 16} ${o.cx + 6},${top + 3} ${o.cx - 6},${top + 3}`
}
const centre = openings[2]!

// Arches further down the colonnade, seen through the central arch,
// shrinking towards the vanishing point on the horizon.
const corridor = [0.78, 0.6, 0.46, 0.35, 0.27, 0.2].map((s) => {
  const bottom = HORIZON + (BASE - HORIZON) * s
  const height = (BASE - centre.spring) * s
  return { d: arch(600, centre.w * s, bottom - height, bottom), s }
})

// The neon floor: lines running to the vanishing point, and cross lines that
// crowd together towards the horizon.
const floorRays = Array.from({ length: 29 }, (_, i) => i - 14).map((j) => ({ x1: 600 + j * 7, x2: 600 + j * 95 }))
const floorLines = Array.from({ length: 11 }, (_, i) => HORIZON + (H - HORIZON) * ((i + 1) / 11) ** 2.1)

// The sun's stripes, thicker towards the bottom, as on a vaporwave sunset.
const sunStripes = [0, 1, 2, 3, 4, 5].map((i) => ({ y: 430 + i * 17, h: 2 + i * 1.6 }))

const stars = [
  [80, 70, 1.4], [170, 140, 1], [260, 40, 1.2], [340, 110, 0.8], [450, 60, 1.3], [520, 150, 0.9],
  [690, 50, 1.1], [760, 120, 1.4], [850, 70, 0.9], [940, 140, 1.2], [1030, 50, 1], [1120, 120, 1.3],
  [120, 200, 0.8], [1080, 210, 0.9], [380, 30, 0.7], [620, 95, 0.8],
] as const

// The wax: a circle with a few soft bulges, so it looks poured, not stamped.
const waxPath = (() => {
  const points: string[] = []
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2
    const r = 46 + 3 * Math.sin(a * 5) + 2 * Math.sin(a * 9 + 1)
    points.push(`${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`)
  }
  return `M${points.join('L')}Z`
})()
const laurel = Array.from({ length: 16 }, (_, i) => (i / 16) * 360)
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="intro fixed inset-0 z-[70] overflow-hidden"
      :class="[phase === 'opening' ? 'is-opening' : '', reduced ? 'is-reduced' : '']"
      role="dialog"
      aria-modal="true"
      aria-labelledby="intro-title"
    >
      <!-- Everything that moves through the arch together: the scene and the seal. -->
      <div class="scene absolute inset-0" :style="{ transformOrigin: `${placement.x}px ${placement.y}px` }">
        <svg :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="xMidYMid slice" class="absolute inset-0 size-full" aria-hidden="true">
          <defs>
            <linearGradient :id="id('sky')" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stop-color="#07021a" />
              <stop offset="0.4" stop-color="#1e0838" />
              <stop offset="0.62" stop-color="#4a1150" />
              <stop offset="0.65" stop-color="#7a1f6e" />
            </linearGradient>
            <linearGradient :id="id('sun')" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stop-color="#ffd6f2" />
              <stop offset="0.45" stop-color="#ff6ec7" />
              <stop offset="1" stop-color="#9f3878" />
            </linearGradient>
            <mask :id="id('stripes')">
              <rect x="400" y="250" width="400" height="300" fill="#fff" />
              <rect v-for="(s, i) in sunStripes" :key="i" x="400" :y="s.y" width="400" :height="s.h" fill="#000" />
            </mask>
            <linearGradient :id="id('floor')" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stop-color="#2a0b3a" />
              <stop offset="1" stop-color="#0b0216" />
            </linearGradient>
            <linearGradient :id="id('wall')" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stop-color="#6d1f86" />
              <stop offset="1" stop-color="#2a0a3f" />
            </linearGradient>
            <filter :id="id('glow')" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <clipPath :id="id('through')">
              <path :d="`${arch(centre.cx, centre.w, centre.spring, BASE)} Z`" />
            </clipPath>
          </defs>

          <!-- Sky, stars and the striped sun sitting on the horizon -->
          <rect :width="W" :height="HORIZON" :fill="`url(#${id('sky')})`" />
          <circle v-for="([x, y, r], i) in stars" :key="i" class="star" :cx="x" :cy="y" :r="r" fill="#fff" :style="{ animationDelay: `${(i * 0.37) % 3}s` }" />
          <circle class="sun" cx="600" cy="420" r="165" :fill="`url(#${id('sun')})`" :mask="`url(#${id('stripes')})`" />

          <!-- The neon floor -->
          <rect :y="HORIZON" :width="W" :height="H - HORIZON" :fill="`url(#${id('floor')})`" />
          <g class="grid" stroke="#ff4fd8" stroke-width="1.5" :filter="`url(#${id('glow')})`">
            <line v-for="(r, i) in floorRays" :key="`r${i}`" :x1="r.x1" :y1="HORIZON" :x2="r.x2" :y2="H" stroke-opacity="0.55" />
            <line v-for="(y, i) in floorLines" :key="`l${i}`" x1="0" :x2="W" :y1="y" :y2="y" stroke-opacity="0.55" />
          </g>
          <line x1="0" :x2="W" :y1="HORIZON" :y2="HORIZON" stroke="#ff9be3" stroke-width="2" :filter="`url(#${id('glow')})`" />

          <!-- Down the colonnade: further arches, seen through the central one -->
          <g :clip-path="`url(#${id('through')})`">
            <path
              v-for="(c, i) in corridor"
              :key="i"
              class="corridor"
              :d="c.d"
              fill="none"
              stroke="#c084fc"
              :stroke-width="3 * c.s + 1"
              :stroke-opacity="0.9 - i * 0.12"
              :filter="`url(#${id('glow')})`"
              :style="{ animationDelay: `${0.25 + i * 0.07}s` }"
            />
          </g>

          <!-- The name, in Greek, above the building -->
          <text
            x="600"
            y="150"
            text-anchor="middle"
            class="font-serif"
            font-size="64"
            font-weight="700"
            letter-spacing="8"
            fill="#ffd6f2"
            :filter="`url(#${id('glow')})`"
          >στοά</text>

          <!-- The arcade: a purple wall with five arches cut out of it -->
          <path :d="facade" fill-rule="evenodd" :fill="`url(#${id('wall')})`" />

          <!-- Pilasters between the bays, each with a base and a capital -->
          <g v-for="x in pilasters" :key="x">
            <rect :x="x - PILASTER / 2" :y="WALL_TOP + 16" :width="PILASTER" :height="BASE - WALL_TOP - 30" fill="#7d2a96" />
            <rect :x="x - PILASTER / 2 - 6" :y="WALL_TOP" :width="PILASTER + 12" height="16" fill="#9a3cb4" />
            <rect :x="x - PILASTER / 2 - 6" :y="BASE - 14" :width="PILASTER + 12" height="14" fill="#9a3cb4" />
          </g>

          <!-- Entablature: architrave, frieze and a projecting cornice, then the pediment -->
          <rect x="108" y="286" width="984" :height="WALL_TOP - 286" fill="#5a1a72" />
          <rect x="108" y="268" width="984" height="18" fill="#4a1460" />
          <rect x="92" y="256" width="1016" height="12" fill="#8a33a6" />
          <polygon points="92,256 600,178 1108,256" fill="#4a1460" />
          <polygon points="150,249 600,190 1050,249" fill="#3a0f4f" />

          <!-- Keystones -->
          <polygon v-for="o in openings" :key="`k${o.cx}`" :points="keystone(o)" fill="#9a3cb4" />

          <!-- Neon edges: arches, archivolts, imposts, pilasters, entablature and pediment -->
          <g class="neon" fill="none" stroke="#f472d0" stroke-width="3" stroke-linejoin="round" :filter="`url(#${id('glow')})`">
            <path v-for="o in openings" :key="`a${o.cx}`" :d="arch(o.cx, o.w, o.spring, BASE)" />
            <path v-for="o in openings" :key="`v${o.cx}`" :d="archivolt(o)" stroke-width="2" />
            <template v-for="o in openings" :key="`i${o.cx}`">
              <line :x1="o.cx - o.w / 2 - 12" :x2="o.cx - o.w / 2" :y1="o.spring" :y2="o.spring" />
              <line :x1="o.cx + o.w / 2" :x2="o.cx + o.w / 2 + 12" :y1="o.spring" :y2="o.spring" />
            </template>
            <rect v-for="x in pilasters" :key="`p${x}`" :x="x - PILASTER / 2" :y="WALL_TOP + 16" :width="PILASTER" :height="BASE - WALL_TOP - 30" stroke-width="2" />
            <line x1="108" x2="1092" y1="286" y2="286" stroke-width="2" />
            <rect x="92" y="256" width="1016" :height="WALL_TOP - 256" />
            <polygon points="92,256 600,178 1108,256" />
          </g>
        </svg>

        <!-- The seal: a real button over the central arch. Its halves fall away when it breaks. -->
        <button
          ref="seal"
          type="button"
          class="seal absolute -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          :style="{ left: `${placement.x}px`, top: `${placement.y}px`, width: `${placement.size}px`, height: `${placement.size}px` }"
          aria-label="Break the seal to enter"
          @click="enter"
        >
          <svg viewBox="-60 -60 120 120" class="size-full overflow-visible" aria-hidden="true">
            <defs>
              <radialGradient :id="id('wax')" cx="0.38" cy="0.32" r="0.75">
                <stop offset="0" stop-color="#e07ab5" />
                <stop offset="0.45" stop-color="#9f3878" />
                <stop offset="1" stop-color="#5a1844" />
              </radialGradient>
              <!-- A jagged crack down the middle -->
              <clipPath :id="id('left')"><polygon points="-62,-62 3,-62 -5,-28 5,-4 -4,22 3,62 -62,62" /></clipPath>
              <clipPath :id="id('right')"><polygon points="3,-62 62,-62 62,62 3,62 -4,22 5,-4 -5,-28" /></clipPath>
              <g :id="id('wax-face')">
                <path :d="waxPath" :fill="`url(#${id('wax')})`" />
                <circle r="33" fill="none" stroke="#f0a6ca" stroke-opacity="0.35" stroke-width="2" />
                <ellipse
                  v-for="angle in laurel"
                  :key="angle"
                  cx="0"
                  cy="-39"
                  rx="2.6"
                  ry="6"
                  fill="#f0a6ca"
                  fill-opacity="0.4"
                  :transform="`rotate(${angle})`"
                />
                <text y="13" text-anchor="middle" class="font-serif" font-size="38" font-weight="700" fill="#3d0f2e" fill-opacity="0.6">Σ</text>
                <text y="11" text-anchor="middle" class="font-serif" font-size="38" font-weight="700" fill="#f6c2de">Σ</text>
              </g>
            </defs>
            <g class="half half-left" :clip-path="`url(#${id('left')})`"><use :href="`#${id('wax-face')}`" /></g>
            <g class="half half-right" :clip-path="`url(#${id('right')})`"><use :href="`#${id('wax-face')}`" /></g>
          </svg>
        </button>
      </div>

      <button
        type="button"
        class="skip absolute top-4 right-4 z-10 min-h-9 rounded-full bg-black/30 px-4 text-sm font-medium text-white/80 ring-1 ring-white/25 backdrop-blur hover:bg-white/10 hover:text-white"
        @click="done"
      >
        Skip intro
      </button>
      <PitchNote id="intro" class="absolute top-4 left-4" />

      <div class="caption pointer-events-none absolute inset-x-0 bottom-[max(2rem,env(safe-area-inset-bottom))] px-4 text-center">
        <h2 id="intro-title" class="font-serif text-4xl font-bold tracking-tight text-white drop-shadow sm:text-5xl">Stoa</h2>
        <p class="mt-1 text-sm text-white/80 drop-shadow">Break the seal to enter</p>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.intro {
  background: #07021a;
}

/* Waiting: stars twinkle, the sun shimmers and the seal glows, inviting a click. */
.star {
  animation: twinkle 3s ease-in-out infinite;
}
@keyframes twinkle {
  50% {
    opacity: 0.35;
  }
}
.sun {
  animation: shimmer 4s ease-in-out infinite;
}
@keyframes shimmer {
  50% {
    opacity: 0.85;
  }
}
.seal {
  animation: glow 2.4s ease-in-out infinite;
}
@keyframes glow {
  50% {
    filter: drop-shadow(0 0 16px rgb(244 114 208 / 0.85));
  }
}

/* SVG parts animate around their own box, or around the vanishing point. */
.half {
  transform-box: fill-box;
}
.corridor {
  transform-box: view-box;
  transform-origin: 600px 520px;
}

/* Opening, about two seconds in all. */
.is-opening .seal {
  animation: none;
}
.is-opening .skip,
.is-opening .caption {
  transition: opacity 0.25s ease;
  opacity: 0;
}
.is-opening .half-left {
  transform-origin: right center;
  animation: fall-left 0.7s cubic-bezier(0.5, 0, 0.75, 0) forwards;
}
.is-opening .half-right {
  transform-origin: left center;
  animation: fall-right 0.7s cubic-bezier(0.5, 0, 0.75, 0) forwards;
}
@keyframes fall-left {
  to {
    transform: translate(-28px, 150px) rotate(-38deg);
    opacity: 0;
  }
}
@keyframes fall-right {
  to {
    transform: translate(28px, 150px) rotate(38deg);
    opacity: 0;
  }
}
/* The neon flares as the seal breaks. */
.is-opening .neon {
  animation: flare 0.6s ease-out 0.1s forwards;
}
@keyframes flare {
  40% {
    stroke: #fff;
    stroke-width: 6;
  }
  to {
    stroke: #ffb3ea;
    stroke-width: 4.5;
  }
}
/* The arches down the colonnade rush towards the viewer, one after another. */
.is-opening .corridor {
  animation: rush 1.1s cubic-bezier(0.5, 0, 0.9, 0.4) forwards;
}
@keyframes rush {
  to {
    transform: scale(4);
    opacity: 0;
  }
}
/* And the view moves through the central arch. */
.is-opening .scene {
  animation: push 1.2s cubic-bezier(0.55, 0, 0.85, 0.35) 0.6s forwards;
}
@keyframes push {
  to {
    transform: scale(10);
  }
}
.is-opening {
  animation: fade 0.5s ease 1.5s forwards;
}
@keyframes fade {
  to {
    opacity: 0;
  }
}

/* Reduce motion: nothing falls, flares, rushes or moves. A short fade only. */
.is-reduced.is-opening,
.is-reduced.is-opening * {
  animation: none !important;
}
.is-reduced.is-opening {
  transition: opacity 0.3s ease;
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .star,
  .sun,
  .seal {
    animation: none;
  }
}
</style>
