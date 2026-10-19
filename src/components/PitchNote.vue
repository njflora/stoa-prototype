<script setup lang="ts">
import { computed, ref } from 'vue'
import { getPitchNote, pillLabel } from '@/data/pitchNotes'
import { usePitchMode } from '@/composables/usePitchMode'

// A small pitch-mode label on one improvement. It renders nothing unless
// pitch mode is on, so it never changes the layout. The parent positions
// it with a class, for example "absolute top-3 left-3" over a card.

const props = defineProps<{ id: string }>()

const { enabled, openId, open } = usePitchMode()
const note = computed(() => getPitchNote(props.id))
const button = ref<HTMLButtonElement>()

const styles = {
  fix: 'bg-accent text-white ring-1 ring-white/30',
  proposal: 'bg-ink/85 text-gold border border-dashed border-gold',
  kept: 'bg-raised text-white/85 ring-1 ring-white/25',
}
</script>

<template>
  <button
    v-if="enabled && note"
    ref="button"
    type="button"
    class="z-20 inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] leading-4 font-bold tracking-wide whitespace-nowrap uppercase shadow-lg shadow-black/40 transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    :class="styles[note.kind]"
    :aria-label="`Pitch note: ${pillLabel(note)}. ${note.title}`"
    :aria-expanded="openId === note.id"
    aria-controls="pitch-drawer"
    @click.stop.prevent="open(note.id, button ?? null)"
  >
    <span aria-hidden="true">{{ note.kind === 'proposal' ? '◇' : note.kind === 'kept' ? '✓' : '●' }}</span>
    {{ pillLabel(note) }}
  </button>
</template>
