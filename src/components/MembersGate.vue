<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AppIcon from './AppIcon.vue'
import { useViewer } from '@/composables/useViewer'

// Members-only content, seen by someone who is not a member: a blurred
// glimpse of what is inside, behind an invitation, so it feels exclusive
// (Nick's call). Used by comment sections and reading lists on members'
// shows. The glimpse is inert: it cannot be read out, focused or clicked.
// A real site would not send the hidden content at all, only a count.

defineProps<{
  /** Such as "The members' discussion". */
  title: string
  /** Such as "11 comments from members. Join to read them and have your say." */
  detail: string
}>()

const { isSignedIn } = useViewer()
</script>

<template>
  <div class="relative min-h-72 overflow-hidden rounded-xl ring-1 ring-gold/30">
    <div class="pointer-events-none p-4 blur-[7px] select-none" aria-hidden="true" inert>
      <slot />
    </div>
    <div class="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/70 to-ink/95" />
    <div class="absolute inset-0 grid place-items-center p-4 text-center">
      <div class="max-w-sm">
        <span class="mx-auto grid size-11 place-items-center rounded-full bg-gold/15 text-gold ring-1 ring-gold/40">
          <AppIcon name="crown" />
        </span>
        <p class="mt-3 text-lg font-semibold">{{ title }}</p>
        <p class="mt-1 text-sm text-white/80">{{ detail }}</p>
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
