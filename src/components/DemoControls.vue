<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { livePhases, useViewer, viewerTypes } from '@/composables/useViewer'
// Loaded here so the demo's "live now" notification works from any page.
import '@/composables/useReminders'
import { usePlayback } from '@/composables/usePlayback'
import { useWatchProgress } from '@/composables/useWatchProgress'

// Demo-only panel for pitching. It switches between a signed-out visitor,
// a free account and a member, moves the live show through its phases,
// and resets watch progress. It is not part of the site design.

const { viewer, phase, setViewer, setPhase } = useViewer()
const { reset } = useWatchProgress()
const { requestFinish } = usePlayback()
const route = useRoute()
const open = ref(false)

const segment = 'rounded-md px-3 py-1 text-xs font-medium transition'
const on = 'bg-white text-ink'
const off = 'text-white/70 hover:text-white'
</script>

<template>
  <div class="fixed bottom-4 left-4 z-50 text-sm">
    <div
      v-if="open"
      id="demo-panel"
      class="mb-2 w-64 space-y-3 rounded-xl bg-raised/95 p-4 shadow-2xl ring-1 ring-white/10 backdrop-blur"
    >
      <p class="text-xs text-muted">Demo controls. Not part of the design.</p>

      <div>
        <p class="mb-1 text-xs font-semibold">Viewing as</p>
        <div class="flex flex-wrap gap-1 rounded-lg bg-black/40 p-1" role="group" aria-label="Viewing as">
          <button
            v-for="v in viewerTypes"
            :key="v.id"
            type="button"
            :class="[segment, viewer === v.id ? on : off]"
            :aria-pressed="viewer === v.id"
            @click="setViewer(v.id)"
          >
            {{ v.label }}
          </button>
        </div>
      </div>

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

      <button type="button" class="text-xs text-muted underline hover:text-white" @click="reset">
        Reset watch progress
      </button>
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
