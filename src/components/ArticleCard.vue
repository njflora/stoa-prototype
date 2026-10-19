<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { articleCategoryColours, hostNames } from '@/data/catalogue'
import type { Article } from '@/types/content'
import { formatPublished } from '@/utils/format'

// A still, editorial thumbnail for written pieces. No motion and no play
// icon, so articles read as "read" rather than "watch" next to episodes.
// It matches the episode card's size so rows line up.

const props = defineProps<{ article: Article }>()

const colours = computed(() => articleCategoryColours[props.article.category])
</script>

<template>
  <RouterLink
    :to="`/articles/${article.id}`"
    class="group block w-60 flex-none snap-start outline-none sm:w-72"
  >
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

    <div class="mt-2 px-0.5">
      <p class="line-clamp-2 text-sm leading-snug text-white/80">{{ article.standfirst }}</p>
      <p class="mt-0.5 truncate text-xs text-muted">
        {{ hostNames([article.authorId]) }} · {{ article.readMin }} min read ·
        {{ formatPublished(article.publishedAt) }}
      </p>
    </div>
  </RouterLink>
</template>
