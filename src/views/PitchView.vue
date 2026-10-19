<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { kindNames, pillLabel, pitchNotes, type PitchNote } from '@/data/pitchNotes'
import { usePitchMode } from '@/composables/usePitchMode'

// Every pitch note in one place, grouped by page, with a link to where it
// appears. Doubles as the running order for a walkthrough.

const { enabled } = usePitchMode()

const groups = computed(() => {
  const byPage = new Map<string, { name: string; to: string; notes: PitchNote[] }>()
  for (const note of pitchNotes) {
    const group = byPage.get(note.page.name) ?? { ...note.page, notes: [] }
    group.notes.push(note)
    byPage.set(note.page.name, group)
  }
  return [...byPage.values()]
})

const counts = computed(() => ({
  fix: pitchNotes.filter((n) => n.kind === 'fix').length,
  proposal: pitchNotes.filter((n) => n.kind === 'proposal').length,
  kept: pitchNotes.filter((n) => n.kind === 'kept').length,
}))

const pill = {
  fix: 'bg-accent text-white',
  proposal: 'border border-dashed border-gold text-gold',
  kept: 'bg-raised text-white/85',
}
</script>

<template>
  <main class="max-w-4xl px-4 pt-10 sm:px-8">
    <h1 class="text-3xl font-bold">Pitch notes</h1>
    <p class="mt-2 text-white/80">
      Every improvement in this prototype, the finding it answers, and what the real site does today.
      {{ counts.fix }} answer findings, {{ counts.proposal }} are proposals and {{ counts.kept }} credit what the real
      site already does well.
    </p>
    <div class="mt-4 flex flex-wrap items-center gap-3 text-sm">
      <button
        type="button"
        class="rounded-lg px-4 py-2 font-semibold transition"
        :class="enabled ? 'bg-white/15 hover:bg-white/25' : 'bg-accent text-white hover:bg-accent-bright'"
        :aria-pressed="enabled"
        @click="enabled = !enabled"
      >
        {{ enabled ? 'Pitch mode is on. Turn it off' : 'Turn on pitch mode' }}
      </button>
      <span class="text-xs text-muted">Labels appear on each page when pitch mode is on.</span>
    </div>

    <section v-for="group in groups" :key="group.name" class="mt-10" :aria-labelledby="`pitch-${group.name}`">
      <div class="flex items-baseline justify-between gap-3">
        <h2 :id="`pitch-${group.name}`" class="text-xl font-semibold">{{ group.name }}</h2>
        <RouterLink :to="group.to" class="text-sm text-accent-bright hover:underline">Show me</RouterLink>
      </div>
      <ul class="mt-3 divide-y divide-white/5 rounded-xl bg-surface ring-1 ring-white/10">
        <li v-for="note in group.notes" :key="note.id" class="p-4">
          <div class="flex flex-wrap items-center gap-2">
            <span class="rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase" :class="pill[note.kind]">
              {{ pillLabel(note) }}
            </span>
            <span class="font-semibold">{{ note.title }}</span>
            <span class="sr-only">({{ kindNames[note.kind] }})</span>
          </div>
          <p class="mt-2 text-sm text-white/75"><span class="text-muted">Today:</span> {{ note.today }}</p>
          <p class="mt-1 text-sm text-white/75"><span class="text-muted">Here:</span> {{ note.here }}</p>
          <p v-if="note.hint" class="mt-1 text-xs text-muted">{{ note.hint }}</p>
        </li>
      </ul>
    </section>
  </main>
</template>
