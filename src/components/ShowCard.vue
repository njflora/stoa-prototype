<script setup lang="ts">
import { RouterLink } from 'vue-router'
import PreviewSoundButton from './PreviewSoundButton.vue'
import TitleCard from './TitleCard.vue'
import { hostNames } from '@/data/catalogue'
import { usePreview } from '@/composables/usePreview'
import type { Show } from '@/types/content'

// One show in the Shows grid. Still at rest; plays the show's themed
// preview on hover or focus, like episode cards. Anyone can preview a
// show's page, so nothing here is locked.

defineProps<{ show: Show }>()

const { root, previewing, handlers } = usePreview(() => true)
</script>

<template>
  <div class="relative min-w-0" v-on="handlers">
    <PreviewSoundButton v-if="previewing" />
    <RouterLink :to="`/shows/${show.id}`" class="group block outline-none">
      <div
        ref="root"
        class="relative aspect-video overflow-hidden rounded-lg ring-1 ring-white/10 transition duration-300 group-hover:ring-white/30 group-focus-visible:ring-2 group-focus-visible:ring-accent-bright"
      >
        <TitleCard
          :show="show"
          :label="`${show.episodeCount?.toLocaleString('en-GB')} episodes`"
          :animated="previewing"
          :preview="previewing"
          class="transition duration-500 group-hover:scale-105"
        />
        <span
          class="absolute top-2 left-2 rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase"
          :class="show.access === 'free' ? 'bg-white text-ink' : 'bg-gold text-ink'"
        >
          {{ show.access === 'free' ? 'Free' : 'Members' }}
        </span>
      </div>
      <div class="mt-2 px-0.5">
        <p class="text-base font-semibold text-white/95 group-hover:text-white">{{ show.name }}</p>
        <p class="mt-0.5 line-clamp-2 text-sm leading-snug text-white/75">{{ show.tagline }}</p>
        <p class="mt-1 truncate text-xs text-muted">{{ hostNames(show.hostIds) }}</p>
        <p v-if="show.schedule" class="mt-0.5 truncate text-xs text-muted">{{ show.schedule }}</p>
      </div>
    </RouterLink>
  </div>
</template>
