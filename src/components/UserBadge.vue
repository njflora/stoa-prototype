<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { tierStyles } from '@/data/chat'
import type { DemoUser } from '@/composables/useViewer'

// The signed-in viewer: initials, username and, for members, their tier.
// On small screens only the initials show.

defineProps<{ user: DemoUser }>()
</script>

<template>
  <RouterLink
    to="/account"
    class="flex items-center gap-2 rounded-full py-1 pr-1 pl-1 hover:bg-white/10 md:pr-3"
    :aria-label="`Account: ${user.name}${user.tier ? `, ${tierStyles[user.tier].label} member` : ''}`"
  >
    <span class="grid size-7 place-items-center rounded-full bg-accent text-[11px] font-bold">
      {{ user.initials }}
    </span>
    <span class="hidden text-sm font-medium md:inline">{{ user.name }}</span>
    <span
      v-if="user.tier"
      class="hidden rounded px-1.5 py-px text-[10px] font-bold tracking-wide uppercase md:inline"
      :class="tierStyles[user.tier].class"
    >
      {{ tierStyles[user.tier].label }}
    </span>
  </RouterLink>
</template>
