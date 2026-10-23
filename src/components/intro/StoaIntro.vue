<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import PitchNote from '@/pitch/PitchNote.vue'
import { useIntro } from '@/composables/useIntro'
import { brand } from '@/config/brand'
import IntroBand from './IntroBand.vue'
import IntroColonnade from './IntroColonnade.vue'
import IntroSeal from './IntroSeal.vue'
import { placement as placeOn } from './scene'
import './intro.css'

// The welcome: the view down a Greek stoa, like standing in the Stoa of
// Attalos, in a modern, vaporwave style, seen from low down and looking up.
// Rows of towering Doric columns on both sides and the ceiling beams all
// run to one point in the middle of the screen, where a striped sun is
// setting and the purple wax seal waits, so every line leads to the seal.
// Breaking it (a real button) makes the neon flare, and the view moves down
// the colonnade into the light and into the site, which has been loading
// behind.
// - Keyboard: the seal has focus; Enter or Space opens it, Escape skips.
// - "Reduce motion": nothing falls, flares or moves, just a short fade.
// - While open, the page behind is inert, so focus cannot wander into it.
// Plain inline SVG and CSS. App.vue loads this folder only when the welcome
// shows. The drawing is in scene.ts and the Intro* components; the animation
// is in intro.css.

const { open, finish } = useIntro()

const OPEN_MS = 2000
const FADE_MS = 300

const phase = ref<'idle' | 'opening'>('idle')
const reduced = ref(false)
const seal = ref<HTMLButtonElement>()
let timer: ReturnType<typeof setTimeout> | undefined

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

// The seal and the band follow the screen's size.
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
const placement = computed(() => placeOn(screen.value))
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
        <IntroColonnade />
        <IntroBand :height="placement.band" />

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
          <IntroSeal />
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
