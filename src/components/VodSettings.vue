<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import AppIcon from './AppIcon.vue'

// The player's settings menu: quality and speed, one level at a time.
// Escape closes it. VodPlayer shows it and applies the choices; a live
// stream plays in real time, so it has no speed setting.

const props = defineProps<{
  /** The sizes this browser can play, "Auto" first. */
  qualities: string[]
  quality: string
  speed: number
  live?: boolean
}>()
const emit = defineEmits<{ quality: [choice: string]; speed: [rate: number]; close: [] }>()

/** The preset speeds. The slider goes anywhere from 0.25 to 3 times. */
const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2]
const speedName = (rate: number) => (rate === 1 ? 'Normal' : `${rate}×`)

const view = ref<'main' | 'quality' | 'speed'>('main')
const panel = ref<HTMLElement>()

/** Show one level, with the keyboard on its first control. */
async function openView(next: typeof view.value) {
  view.value = next
  await nextTick()
  panel.value?.querySelector<HTMLElement>('button, input')?.focus()
}
onMounted(() => void openView('main'))

function chooseQuality(choice: string) {
  if (choice !== props.quality) emit('quality', choice)
  void openView('main')
}
function chooseSpeed(rate: number) {
  emit('speed', rate)
  void openView('main')
}
</script>

<template>
  <div
    ref="panel"
    role="group"
    aria-label="Player settings"
    class="absolute right-2 bottom-16 z-10 max-h-[calc(100%-5rem)] w-56 overflow-y-auto rounded-lg bg-ink/95 p-1 text-sm shadow-2xl ring-1 ring-white/10 backdrop-blur sm:right-3"
    @keydown.esc.stop="emit('close')"
    @pointerdown.stop
  >
    <template v-if="view === 'main'">
      <button
        type="button"
        class="flex w-full items-center justify-between rounded-md px-3 py-2 hover:bg-white/10"
        @click="openView('quality')"
      >
        Quality
        <span class="flex items-center gap-1 text-white/70"
          >{{ quality }}<AppIcon name="chevron-right" class="size-4"
        /></span>
      </button>
      <button
        v-if="!live"
        type="button"
        class="flex w-full items-center justify-between rounded-md px-3 py-2 hover:bg-white/10"
        @click="openView('speed')"
      >
        Speed
        <span class="flex items-center gap-1 text-white/70"
          >{{ speedName(speed) }}<AppIcon name="chevron-right" class="size-4"
        /></span>
      </button>
    </template>

    <template v-else>
      <button
        type="button"
        class="flex w-full items-center gap-1 rounded-md px-2 py-2 font-semibold hover:bg-white/10"
        @click="openView('main')"
      >
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
            Custom
            <span
              class="font-semibold text-white tabular-nums"
              :class="speeds.includes(speed) ? '' : 'text-accent-bright'"
              >{{ speed }}×</span
            >
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
            @input="emit('speed', Number(($event.target as HTMLInputElement).value))"
          />
        </label>
      </template>
    </template>
  </div>
</template>
