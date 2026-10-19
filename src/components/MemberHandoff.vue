<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AppIcon from './AppIcon.vue'

// The conversion moment, pinned in chat. The free stream ends and the
// members' after-show starts about 30 minutes later. Free viewers get a
// clear route in; members are told they are already in.

defineProps<{
  isMember: boolean
  countdown: string
}>()
</script>

<template>
  <div class="flex flex-col gap-3 rounded-lg bg-gradient-to-r from-accent/45 to-raised p-3 ring-1 ring-white/10">
    <div>
      <p class="text-[10px] font-bold tracking-widest text-gold uppercase">Pinned</p>
      <p class="text-sm font-semibold">
        Members' after-show starts in <span class="tabular-nums">{{ countdown }}</span>
      </p>
      <p class="mt-0.5 text-xs text-white/75">
        {{
          isMember
            ? "You're in. Stay on this page and it starts by itself."
            : 'The hosts carry on for members, with Gold questions answered live.'
        }}
      </p>
    </div>
    <RouterLink
      v-if="!isMember"
      to="/join"
      class="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-ink hover:brightness-110"
    >
      <AppIcon name="lock" />
      Continue as a member
    </RouterLink>
  </div>
</template>
