<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, useId, watch } from 'vue'
import PitchNote from './PitchNote.vue'
import { useIntro } from '@/composables/useIntro'
import { brand } from '@/config/brand'

// The welcome: the view down a Greek stoa, like standing in the Stoa of
// Attalos, in a modern, vaporwave style, seen from low down and looking up.
// Rows of towering Doric columns on both sides and the ceiling beams all
// run to one point in the middle of the screen, where a striped sun is
// setting and the purple wax seal waits, so every line leads to the seal. Breaking it (a real button) makes the neon
// flare, and the view moves down the colonnade into the light and into the
// site, which has been loading behind.
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
      // Focused for the keyboard, without a ring on arrival. Tab still shows it.
      seal.value?.focus({ focusVisible: false })
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

// The corridor is drawn in a 1200 by 800 box and fills the screen
// (preserveAspectRatio "slice"), centred, so the vanishing point and the
// seal on it are always in the middle of the screen. The night sky, the
// name and the lintel are a separate band pinned to the top, so the name is
// never cropped whatever the screen's shape. The seal button and the band's
// height are worked out from the screen size.
const W = 1200
const H = 800
const SEAL = { x: 600, y: 400 } // the vanishing point: the middle of the box
const BAND = { w: 1200, h: 64, sky: 50 } // the top band: sky from 0 to 50, then the lintel
const topStars = [
  [60, 14, 1.2],
  [150, 34, 0.9],
  [240, 10, 1.1],
  [330, 28, 0.8],
  [420, 16, 1],
  [780, 20, 1],
  [870, 36, 0.9],
  [960, 12, 1.2],
  [1050, 30, 0.8],
  [1140, 18, 1.1],
  [500, 40, 0.7],
  [700, 8, 0.8],
] as const
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
  // The band keeps its proportions on wide screens and never gets thinner than 52px.
  const band = Math.min(110, Math.max(52, (BAND.h * screen.value.w) / BAND.w))
  return {
    x,
    y,
    // At least 56px to tap on a phone, at most 150px on very wide screens.
    size: Math.min(150, Math.max(56, 112 * scale)),
    band,
    // Just below the band, so the buttons never sit on the name.
    belowLintel: band + 12,
  }
})

// ---------- the drawing ----------
// One-point perspective, seen from low down, close to the floor and looking
// up: the floor is near eye level and the ceiling high above, so the columns
// tower overhead. Everything is placed by its depth: `d` is 1 at the
// entrance and shrinks towards 0 down the corridor; above 1 is nearer than
// the entrance. A point at depth d sits at VP + offset * d, so all lines meet
// at the vanishing point, VP, where the seal waits.
const VP = { x: 600, y: 400 }
const HALF_WIDTH = 560 // from the middle of the floor to a column's centre, at the entrance
const FLOOR = 160 // below eye level, at the entrance: a low viewpoint
const CEILING = 520 // above eye level, at the entrance
const FAR = 0.155 // the depth of the far end, where the corridor opens to the sunset
const NEAR = 2.6 // nearer than the entrance, far enough for the floor to reach the bottom of the screen

const at = (offsetX: number, offsetY: number, d: number) => `${VP.x + offsetX * d},${VP.y + offsetY * d}`

// Heights above eye level (negative is up) for each part of a column.
const SHAFT_TOP = -440
const ECHINUS_TOP = -460
const ABACUS_TOP = -474

/** One Doric column at depth d on the given side: a tapering fluted shaft, its cushion and slab. */
function column(side: -1 | 1, d: number) {
  const x = side * HALF_WIDTH
  return {
    key: `${side}${d}`,
    d,
    shaft: [at(x - 38, FLOOR, d), at(x + 38, FLOOR, d), at(x + 30, SHAFT_TOP, d), at(x - 30, SHAFT_TOP, d)].join(' '),
    echinus: [
      at(x - 30, SHAFT_TOP, d),
      at(x + 30, SHAFT_TOP, d),
      at(x + 48, ECHINUS_TOP, d),
      at(x - 48, ECHINUS_TOP, d),
    ].join(' '),
    abacus: [
      at(x - 50, ECHINUS_TOP, d),
      at(x + 50, ECHINUS_TOP, d),
      at(x + 50, ABACUS_TOP, d),
      at(x - 50, ABACUS_TOP, d),
    ].join(' '),
    flutes:
      d > 0.3
        ? [-19, -6, 6, 19].map((f) => ({
            x1: VP.x + (x + f) * d,
            x2: VP.x + (x + f * 0.8) * d,
            y1: VP.y + FLOOR * d,
            y2: VP.y + SHAFT_TOP * d,
          }))
        : [],
  }
}
// Columns at evenly spaced steps down the corridor, drawn far to near so
// nearer columns overlap the ones behind.
const steps = Array.from({ length: 14 }, (_, k) => 1 / (1 + 0.42 * k)).filter((d) => d > FAR)
const columns = [...steps].reverse().flatMap((d) => [column(-1, d), column(1, d)])
// Ceiling beams, closer together than the columns, as in the real stoa.
const beams = Array.from({ length: 34 }, (_, k) => 1.2 / (1 + 0.2 * k)).filter((d) => d > FAR)

// The big shapes, each a quadrilateral from near the viewer to the far end.
const quad = (a: [number, number], b: [number, number]) =>
  [at(a[0], a[1], NEAR), at(b[0], b[1], NEAR), at(b[0], b[1], FAR), at(a[0], a[1], FAR)].join(' ')
const floor = quad([-HALF_WIDTH - 60, FLOOR], [HALF_WIDTH + 60, FLOOR])
const ceiling = quad([-HALF_WIDTH - 60, -CEILING], [HALF_WIDTH + 60, -CEILING])
const leftWall = quad([-HALF_WIDTH - 60, -CEILING], [-HALF_WIDTH - 60, FLOOR])
const rightWall = quad([HALF_WIDTH + 60, -CEILING], [HALF_WIDTH + 60, FLOOR])
// The architrave running along the tops of each row of columns.
const leftBeam = quad([-HALF_WIDTH - 50, -CEILING], [-HALF_WIDTH - 50, ABACUS_TOP])
const rightBeam = quad([HALF_WIDTH + 50, -CEILING], [HALF_WIDTH + 50, ABACUS_TOP])
// The far end: the opening where the corridor meets the sunset.
const end = {
  x: VP.x - (HALF_WIDTH + 60) * FAR,
  y: VP.y - CEILING * FAR,
  w: (HALF_WIDTH + 60) * 2 * FAR,
  h: (CEILING + FLOOR) * FAR,
}
// The neon floor: lines running to the vanishing point, and cross lines at
// each column and nearer, crowding together into the distance.
const floorRays = Array.from({ length: 25 }, (_, i) => (i - 12) * 70).map((offset) => ({
  x1: VP.x + offset * FAR,
  y1: VP.y + FLOOR * FAR,
  x2: VP.x + offset * NEAR,
  y2: VP.y + FLOOR * NEAR,
}))
const floorLines = [...steps, 1.3, 1.65, 2.1, 2.6].map((d) => VP.y + FLOOR * d)

// The sun sits on the far end's floor line. Its lower half is cut by
// vaporwave stripes: thin and far apart near the middle, thicker and closer
// together towards the horizon.
const SUN_Y = VP.y + 12
const sunStripes: { y: number; h: number }[] = []
for (let i = 0, y = SUN_Y - 30; i < 7; i++) {
  const h = 1 + 0.57 * i
  sunStripes.push({ y, h })
  y += h + 7 - 0.9 * i // the band of sun before the next stripe narrows each time
}

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
// The E of Delphi, the old form carved at Apollo's temple: an upright and a
// crossbar between two arcs that bow towards the middle. Drawn about the
// seal's centre, about 40 units tall.
const DELPHIC_E = [
  'M-14,-20 Q-0.6,0 -14,20', // left arc
  'M14,-20 Q0.6,0 14,20', // right arc
  'M0,-15.5 V15.5', // upright
  'M-15.8,0 H15.8', // crossbar
].join(' ')
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
      <!-- Everything that moves together as the view passes between the columns: the scene and the seal. -->
      <div class="scene absolute inset-0" :style="{ transformOrigin: `${placement.x}px ${placement.y}px` }">
        <svg
          :viewBox="`0 0 ${W} ${H}`"
          preserveAspectRatio="xMidYMid slice"
          class="absolute inset-0 size-full"
          aria-hidden="true"
        >
          <defs>
            <linearGradient :id="id('sky')" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stop-color="#1e0838" />
              <stop offset="0.6" stop-color="#7a1f6e" />
              <stop offset="1" stop-color="#ff6ec7" />
            </linearGradient>
            <linearGradient :id="id('sun')" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stop-color="#fff0fa" />
              <stop offset="0.45" stop-color="#ff8fd2" />
              <stop offset="1" stop-color="#c04d93" />
            </linearGradient>
            <radialGradient :id="id('halo')">
              <stop offset="0" stop-color="#ff9be3" stop-opacity="0.75" />
              <stop offset="1" stop-color="#ff9be3" stop-opacity="0" />
            </radialGradient>
            <mask :id="id('stripes')">
              <rect x="480" :y="SUN_Y - 80" width="240" height="160" fill="#fff" />
              <rect v-for="(st, i) in sunStripes" :key="i" x="480" :y="st.y" width="240" :height="st.h" fill="#000" />
            </mask>
            <linearGradient :id="id('floor')" x1="0" x2="0" y1="1" y2="0">
              <stop offset="0" stop-color="#1a0628" />
              <stop offset="1" stop-color="#3a0f4f" />
            </linearGradient>
            <linearGradient :id="id('ceiling')" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stop-color="#12041e" />
              <stop offset="1" stop-color="#3a0f4f" />
            </linearGradient>
            <linearGradient :id="id('column')" x1="0" x2="1">
              <stop offset="0" stop-color="#5d1d7a" />
              <stop offset="0.45" stop-color="#b06ad4" />
              <stop offset="1" stop-color="#4a1462" />
            </linearGradient>
            <filter :id="id('glow')" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <clipPath :id="id('floor-clip')"><polygon :points="floor" /></clipPath>
          </defs>

          <!-- The far end: sunset sky and a striped sun, glowing behind the seal -->
          <rect :width="W" :height="H" :fill="`url(#${id('sky')})`" />
          <circle class="halo" :cx="VP.x" :cy="VP.y" r="190" :fill="`url(#${id('halo')})`" />
          <circle
            class="sun"
            :cx="VP.x"
            :cy="SUN_Y"
            r="66"
            :fill="`url(#${id('sun')})`"
            :mask="`url(#${id('stripes')})`"
          />

          <!-- Walls, ceiling and floor of the stoa, running to the far end -->
          <polygon :points="leftWall" fill="#16051f" />
          <polygon :points="rightWall" fill="#16051f" />
          <polygon :points="ceiling" :fill="`url(#${id('ceiling')})`" />
          <polygon :points="floor" :fill="`url(#${id('floor')})`" />

          <!-- The neon floor -->
          <g
            class="grid"
            :clip-path="`url(#${id('floor-clip')})`"
            stroke="#ff4fd8"
            stroke-width="1.5"
            stroke-opacity="0.55"
            :filter="`url(#${id('glow')})`"
          >
            <line v-for="(r, i) in floorRays" :key="`r${i}`" :x1="r.x1" :y1="r.y1" :x2="r.x2" :y2="r.y2" />
            <line v-for="(y, i) in floorLines" :key="`l${i}`" x1="0" :x2="W" :y1="y" :y2="y" />
          </g>

          <!-- Ceiling beams -->
          <g class="beams" stroke="#c084fc" stroke-linecap="round">
            <line
              v-for="d in beams"
              :key="d"
              :x1="VP.x - (HALF_WIDTH + 50) * d"
              :x2="VP.x + (HALF_WIDTH + 50) * d"
              :y1="VP.y - (CEILING - 16) * d"
              :y2="VP.y - (CEILING - 16) * d"
              :stroke-width="Math.max(1, 14 * d)"
              :stroke-opacity="0.25 + 0.35 * d"
            />
          </g>

          <!-- The architrave along the top of each row of columns -->
          <polygon :points="leftBeam" fill="#4a1460" />
          <polygon :points="rightBeam" fill="#4a1460" />

          <!-- The columns, far to near -->
          <g class="columns">
            <g v-for="c in columns" :key="c.key">
              <polygon :points="c.shaft" :fill="`url(#${id('column')})`" />
              <line
                v-for="(f, i) in c.flutes"
                :key="i"
                :x1="f.x1"
                :x2="f.x2"
                :y1="f.y1"
                :y2="f.y2"
                stroke="#3a0f4f"
                stroke-opacity="0.55"
                :stroke-width="3 * c.d"
              />
              <polygon :points="c.echinus" fill="#8a3aa8" />
              <polygon :points="c.abacus" fill="#b06ad4" />
            </g>
          </g>

          <!-- Neon edges, all leading the eye to the far end -->
          <g class="neon" fill="none" stroke="#f472d0" stroke-linejoin="round" :filter="`url(#${id('glow')})`">
            <polygon v-for="c in columns" :key="`n${c.key}`" :points="c.shaft" :stroke-width="Math.max(1, 3 * c.d)" />
            <polygon :points="leftBeam" stroke-width="2.5" />
            <polygon :points="rightBeam" stroke-width="2.5" />
            <rect :x="end.x" :y="end.y" :width="end.w" :height="end.h" stroke-width="1.5" />
          </g>
        </svg>

        <!-- The band at the top: a strip of night sky with the name in it, then a slim lintel -->
        <svg
          :viewBox="`0 0 ${BAND.w} ${BAND.h}`"
          preserveAspectRatio="xMidYMid slice"
          class="absolute inset-x-0 top-0 w-full"
          :style="{ height: `${placement.band}px` }"
          aria-hidden="true"
        >
          <defs>
            <linearGradient :id="id('night')" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stop-color="#07021a" />
              <stop offset="1" stop-color="#1e0838" />
            </linearGradient>
            <filter :id="id('band-glow')" x="-20%" y="-40%" width="140%" height="180%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect :width="BAND.w" :height="BAND.sky" :fill="`url(#${id('night')})`" />
          <circle
            v-for="([x, y, r], i) in topStars"
            :key="i"
            class="star"
            :cx="x"
            :cy="y"
            :r="r"
            fill="#fff"
            :style="{ animationDelay: `${(i * 0.41) % 3}s` }"
          />
          <rect :y="BAND.sky" :width="BAND.w" :height="BAND.h - BAND.sky" fill="#4a1460" />
          <g stroke="#f472d0" :filter="`url(#${id('band-glow')})`">
            <line x1="0" :x2="BAND.w" :y1="BAND.sky" :y2="BAND.sky" stroke-width="1.5" />
            <line x1="0" :x2="BAND.w" :y1="BAND.h - 1.5" :y2="BAND.h - 1.5" stroke-width="2.5" />
          </g>
          <text
            :x="BAND.w / 2"
            y="40"
            text-anchor="middle"
            class="font-serif"
            font-size="40"
            font-weight="700"
            letter-spacing="6"
            fill="#ffd6f2"
            :filter="`url(#${id('band-glow')})`"
          >
            {{ brand.intro.word }}
          </text>
        </svg>

        <!-- The seal: a real button in the middle of the colonnade. Its halves fall away when it breaks. -->
        <button
          ref="seal"
          type="button"
          class="seal absolute -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          :style="{
            left: `${placement.x}px`,
            top: `${placement.y}px`,
            width: `${placement.size}px`,
            height: `${placement.size}px`,
          }"
          :aria-label="brand.intro.prompt"
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
                <!-- The Delphic E, pressed into the wax: a shadow, then the mark -->
                <path
                  :d="DELPHIC_E"
                  transform="translate(0 1.5)"
                  fill="none"
                  stroke="#3d0f2e"
                  stroke-opacity="0.6"
                  stroke-width="3.2"
                />
                <path :d="DELPHIC_E" fill="none" stroke="#f6c2de" stroke-width="3.2" />
              </g>
            </defs>
            <g class="half half-left" :clip-path="`url(#${id('left')})`"><use :href="`#${id('wax-face')}`" /></g>
            <g class="half half-right" :clip-path="`url(#${id('right')})`"><use :href="`#${id('wax-face')}`" /></g>
          </svg>
        </button>
      </div>

      <button
        type="button"
        class="skip absolute right-4 z-10 min-h-9 rounded-full bg-black/30 px-4 text-sm font-medium text-white/80 ring-1 ring-white/25 backdrop-blur hover:bg-white/10 hover:text-white"
        :style="{ top: `${placement.belowLintel}px` }"
        @click="done"
      >
        Skip intro
      </button>
      <PitchNote id="intro" class="absolute left-4" :style="{ top: `${placement.belowLintel}px` }" />

      <div
        class="caption pointer-events-none absolute inset-x-0 bottom-[max(2rem,env(safe-area-inset-bottom))] px-4 text-center"
      >
        <h2 id="intro-title" class="font-serif text-4xl font-bold tracking-tight text-white drop-shadow sm:text-5xl">
          {{ brand.name }}
        </h2>
        <p class="mt-1 text-sm text-white/80 drop-shadow">{{ brand.intro.prompt }}</p>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.intro {
  background: #07021a;
}

/* Waiting: stars twinkle, the sun shimmers and the seal glows at the end of the corridor, inviting a click. */
.star {
  animation: twinkle 3s ease-in-out infinite;
}
@keyframes twinkle {
  50% {
    opacity: 0.35;
  }
}
.sun,
.halo {
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
.columns,
.beams {
  transform-box: view-box;
  transform-origin: 600px 420px;
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
/* The columns and beams start to rush past, as if walking down the colonnade... */
.is-opening .columns,
.is-opening .beams {
  animation: rush 1.2s cubic-bezier(0.5, 0, 0.9, 0.4) 0.25s forwards;
}
@keyframes rush {
  to {
    transform: scale(2.4);
    opacity: 0;
  }
}
.is-opening .halo {
  animation: dawn 0.9s ease-out 0.2s forwards;
}
@keyframes dawn {
  to {
    transform: scale(2.2);
    opacity: 1;
  }
}
/* ...and the whole view moves down the corridor, into the light. */
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
  .halo,
  .sun,
  .seal {
    animation: none;
  }
}
</style>
