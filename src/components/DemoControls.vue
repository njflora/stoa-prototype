<script setup lang="ts">
import { ref } from 'vue'
import { API_MODE } from '@/api/client'
import { RouterLink, useRoute } from 'vue-router'
import { livePhases, useViewer, viewerTypes } from '@/composables/useViewer'
import { usePitchMode } from '@/pitch/usePitchMode'
import { usePlayback } from '@/composables/usePlayback'
import { useWatchProgress } from '@/composables/useWatchProgress'
import { useIntro } from '@/composables/useIntro'

// Demo-only panel for pitching. It switches between a signed-out visitor,
// a free account and a member (in Laravel mode, by signing in to a seeded
// demo account on the server), moves the live show through its phases,
// and clears or restores watch progress. It is not part of the site design.

const { viewer, isStaff, phase, setViewer, switching, setPhase } = useViewer()
const { clear, restoreSample } = useWatchProgress()

// A short confirmation, so it is clear the button did something.
const progressNote = ref('')
let noteTimer: ReturnType<typeof setTimeout> | undefined
function confirm(note: string) {
  progressNote.value = note
  clearTimeout(noteTimer)
  noteTimer = setTimeout(() => (progressNote.value = ''), 2500)
}
function clearProgress() {
  clear()
  confirm('Watch progress cleared')
}
function restoreProgress() {
  restoreSample()
  confirm('Sample progress restored')
}
const { requestFinish } = usePlayback()
const { replay: replayIntro, forget: forgetVisit } = useIntro()
// Reloads the page as a brand-new visitor would arrive, to test the first visit.
function resetFirstVisit() {
  forgetVisit()
  window.location.reload()
}
const { enabled: pitchMode } = usePitchMode()
const route = useRoute()
const open = ref(false)

function closeAndReplayIntro() {
  open.value = false
  replayIntro()
}

const segment = 'rounded-md px-3 py-1 text-xs font-medium transition'
const on = 'bg-white text-ink'
const off = 'text-white/70 hover:text-white'
</script>

<template>
  <!-- Sits above the phone tab bar (--tabbar-h is 0 on larger screens). -->
  <div class="fixed left-4 z-50 text-sm" :style="{ bottom: 'calc(var(--tabbar-h) + 1rem)' }">
    <div
      v-if="open"
      id="demo-panel"
      class="mb-2 max-h-[calc(100dvh-var(--tabbar-h)-5rem)] w-64 space-y-3 overflow-y-auto rounded-xl bg-raised/95 p-4 shadow-2xl ring-1 ring-white/10 backdrop-blur"
    >
      <p class="text-xs text-muted">Demo controls. Not part of the design.</p>

      <!-- Which version this is, so nobody mistakes the preview's checks for the server's. -->
      <div>
        <p class="mb-1 text-xs font-semibold">Mode</p>
        <p v-if="API_MODE === 'laravel'" class="text-xs text-white/75">
          Laravel API. Saved on the account, and the server checks who can see what.
        </p>
        <p v-else class="text-xs text-white/75">
          Static preview. Saved in this browser. In the Laravel version, the server checks who can see what.
        </p>
      </div>

      <div>
        <p class="mb-1 text-xs font-semibold">Viewing as</p>
        <div class="flex flex-wrap gap-1 rounded-lg bg-black/40 p-1" role="group" aria-label="Viewing as">
          <button
            v-for="v in viewerTypes"
            :key="v.id"
            type="button"
            :class="[segment, viewer === v.id ? on : off]"
            :aria-pressed="viewer === v.id"
            :disabled="switching"
            @click="setViewer(v.id)"
          >
            {{ v.label }}
          </button>
        </div>
      </div>

      <RouterLink
        v-if="isStaff"
        to="/desk"
        class="block text-xs font-semibold text-accent-bright underline underline-offset-2"
      >
        Open the content desk
      </RouterLink>

      <div>
        <p class="mb-1 text-xs font-semibold">Live show</p>
        <div class="flex flex-wrap gap-1 rounded-lg bg-black/40 p-1" role="group" aria-label="Live show phase">
          <button
            v-for="p in livePhases"
            :key="p.id"
            type="button"
            :class="[segment, phase === p.id ? on : off]"
            :aria-pressed="phase === p.id"
            @click="setPhase(p.id)"
          >
            {{ p.label }}
          </button>
        </div>
      </div>

      <!-- The placeholder video never ends, so this stands in for the end of an episode. -->
      <button
        v-if="route.name === 'watch'"
        type="button"
        class="block rounded-md bg-white px-3 py-1 text-xs font-semibold text-ink"
        @click="requestFinish"
      >
        Finish episode
      </button>

      <div>
        <p class="mb-1 text-xs font-semibold">Pitch mode</p>
        <div class="flex flex-wrap items-center gap-2">
          <div class="inline-flex rounded-lg bg-black/40 p-1" role="group" aria-label="Pitch mode">
            <button
              type="button"
              :class="[segment, !pitchMode ? on : off]"
              :aria-pressed="!pitchMode"
              @click="pitchMode = false"
            >
              Off
            </button>
            <button
              type="button"
              :class="[segment, pitchMode ? on : off]"
              :aria-pressed="pitchMode"
              @click="pitchMode = true"
            >
              On
            </button>
          </div>
          <RouterLink to="/pitch" class="inline-flex min-h-6 items-center text-xs text-muted underline hover:text-white"
            >All notes</RouterLink
          >
        </div>
      </div>

      <div class="flex flex-wrap gap-x-3 gap-y-1">
        <button
          type="button"
          class="inline-flex min-h-6 items-center text-xs text-muted underline hover:text-white"
          @click="closeAndReplayIntro"
        >
          Replay intro
        </button>
        <button
          type="button"
          class="inline-flex min-h-6 items-center text-xs text-muted underline hover:text-white"
          @click="resetFirstVisit"
        >
          Reset first visit
        </button>
      </div>

      <div>
        <p class="mb-1 text-xs font-semibold">Watch progress</p>
        <div class="flex flex-wrap gap-x-3 gap-y-1">
          <button
            type="button"
            class="inline-flex min-h-6 items-center text-xs text-muted underline hover:text-white"
            @click="clearProgress"
          >
            Clear watch progress
          </button>
          <button
            type="button"
            class="inline-flex min-h-6 items-center text-xs text-muted underline hover:text-white"
            @click="restoreProgress"
          >
            Restore sample progress
          </button>
        </div>
        <p class="mt-1 h-4 text-xs text-accent-bright" role="status">{{ progressNote }}</p>
      </div>
    </div>

    <button
      type="button"
      class="rounded-full bg-raised px-4 py-2 text-xs font-semibold shadow-lg ring-1 ring-white/15 hover:bg-line"
      :aria-expanded="open"
      aria-controls="demo-panel"
      @click="open = !open"
    >
      {{ open ? 'Close demo' : 'Demo' }}
    </button>
  </div>
</template>
