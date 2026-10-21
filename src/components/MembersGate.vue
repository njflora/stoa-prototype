<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AppIcon from './AppIcon.vue'
import { useViewer } from '@/composables/useViewer'
import PitchNote from './PitchNote.vue'

// Members-only content, seen by someone who is not a member: a blurred
// glimpse behind an invitation, so it feels exclusive (Nick's call). Used by
// comment sections and reading lists on members' shows.
//
// The glimpse is made of neutral placeholder shapes, not the real content:
// the server only sends a count to non-members, so there is nothing real to
// blur. The shapes are generated here and say nothing.

defineProps<{
  /** Such as "The members' discussion". */
  title: string
  /** Such as "11 comments from members. Join to read them and have your say." */
  detail: string
  /** What the placeholder rows look like. */
  kind: 'comments' | 'sources'
}>()

const { isSignedIn } = useViewer()

// Fixed widths, so the rows look like varied text without any text.
const rows = [
  ['w-24', 'w-11/12', 'w-3/5'],
  ['w-32', 'w-4/5', 'w-2/3'],
  ['w-20', 'w-10/12', 'w-1/2'],
]
</script>

<template>
  <div class="relative min-h-72 overflow-hidden rounded-xl ring-1 ring-gold/30">
    <ol class="pointer-events-none space-y-6 p-4 blur-[5px] select-none" aria-hidden="true" inert>
      <li v-for="(widths, i) in rows" :key="i" class="flex gap-3">
        <span v-if="kind === 'comments'" class="size-9 shrink-0 rounded-full bg-raised" />
        <div class="min-w-0 flex-1 space-y-2">
          <span class="block h-3 rounded" :class="[widths[0], kind === 'sources' ? 'bg-gold/30' : 'bg-white/25']" />
          <span class="block h-3 rounded bg-white/15" :class="widths[1]" />
          <span class="block h-3 rounded bg-white/10" :class="widths[2]" />
        </div>
      </li>
    </ol>
    <div class="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/70 to-ink/95" />
    <div class="absolute inset-0 grid place-items-center p-4 text-center">
      <div class="max-w-sm">
        <span class="mx-auto grid size-11 place-items-center rounded-full bg-gold/15 text-gold ring-1 ring-gold/40">
          <AppIcon name="crown" />
        </span>
        <p class="mt-3 text-lg font-semibold">{{ title }}</p>
        <p class="mt-1 text-sm text-white/80">{{ detail }}</p>
        <PitchNote id="members-gate" class="mt-2" />
        <div class="mt-4 flex flex-wrap justify-center gap-2">
          <RouterLink
            to="/join"
            class="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-gold px-4 text-sm font-semibold text-ink hover:brightness-110 [&>svg]:size-4"
          >
            <AppIcon name="crown" />
            Become a member
          </RouterLink>
          <RouterLink
            v-if="!isSignedIn"
            to="/sign-in"
            class="inline-flex min-h-9 items-center rounded-lg px-4 text-sm font-semibold ring-1 ring-white/25 hover:bg-white/10"
          >
            Sign in
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
