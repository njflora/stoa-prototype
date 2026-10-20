<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import ContributorNames from './ContributorNames.vue'
import { articleCategoryColours } from '@/data/catalogue'
import type { Article } from '@/types/content'
import { formatCount, formatPublished } from '@/utils/format'
import AppIcon from './AppIcon.vue'

// A still, editorial thumbnail for written pieces. No motion and no play
// icon, so articles read as "read" rather than "watch" next to episodes.
// It matches the episode card's size so rows line up.

const props = defineProps<{
  article: Article
  /** Fill a grid cell instead of the fixed width used in rows. */
  fluid?: boolean
}>()

const colours = computed(() => articleCategoryColours[props.article.category])
</script>

<template>
  <div :class="fluid ? 'min-w-0' : 'w-60 flex-none snap-start sm:w-72'">
    <RouterLink :to="`/articles/${article.id}`" class="group block outline-none">
      <div
        class="relative aspect-video overflow-hidden rounded-lg ring-1 ring-white/10 transition duration-300 group-hover:ring-white/30 group-focus-visible:ring-2 group-focus-visible:ring-accent-bright"
        :style="{ backgroundColor: colours.base }"
      >
        <div class="absolute inset-y-0 left-0 w-1.5" :style="{ backgroundColor: colours.accent }" />
        <span
          class="pointer-events-none absolute top-1 right-3 h-16 font-serif text-[5.5rem] leading-[1] font-bold opacity-20 select-none"
          :style="{ color: colours.accent }"
          aria-hidden="true"
        >
          &ldquo;
        </span>

        <span
          class="absolute top-2.5 left-4 text-[10px] font-bold tracking-widest uppercase"
          :style="{ color: colours.accent }"
        >
          {{ article.category }}
        </span>

        <p
          class="absolute inset-x-0 bottom-0 line-clamp-3 p-3 pl-4 font-serif text-lg leading-snug font-bold text-white transition group-hover:text-white/85"
        >
          {{ article.title }}
        </p>
      </div>
      <p class="mt-2 line-clamp-2 px-0.5 text-sm leading-snug text-white/80">{{ article.standfirst }}</p>
    </RouterLink>
    <!-- Below the main link, so the author's name can link to their profile. -->
    <p class="mt-0.5 truncate px-0.5 text-xs text-muted">
      <ContributorNames :ids="[article.authorId]" /> · {{ article.readMin }} min read ·
      {{ formatPublished(article.publishedAt) }}
    </p>
    <p v-if="article.views !== undefined" class="mt-0.5 flex items-center gap-2 px-0.5 text-[11px] text-muted [&_svg]:size-3.5">
      <span class="inline-flex items-center gap-0.5" :aria-label="`${article.views} views`"><AppIcon name="eye" /> {{ formatCount(article.views) }}</span>
      <span v-if="article.comments !== undefined" class="inline-flex items-center gap-0.5" :aria-label="`${article.comments} comments`">
        <AppIcon name="chat" /> {{ formatCount(article.comments) }}
      </span>
    </p>
  </div>
</template>
