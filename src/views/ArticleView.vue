<script setup lang="ts">
import ContributorNames from '@/components/ContributorNames.vue'
import { computed, watchEffect } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import ArticleCard from '@/components/ArticleCard.vue'
import ContentRow from '@/components/ContentRow.vue'
import EpisodeCard from '@/components/EpisodeCard.vue'
import ReadingList from '@/components/ReadingList.vue'
import { getArticle, listArticles } from '@/api/catalogue'
import { articleCategoryColours, hostNames } from '@/data/catalogue'
import { useQuery } from '@/composables/useQuery'
import { useViewer } from '@/composables/useViewer'
import { formatCount, formatPublished } from '@/utils/format'
import AppIcon from '@/components/AppIcon.vue'

// One article. After the last paragraph come its sources (Finding 4),
// an episode on the same subject, and more from the same writer.
// The body arrives as plain paragraphs; "## " marks a subheading. It is
// never rendered as HTML, so nothing in the data can inject markup.

const route = useRoute()
const { canWatch } = useViewer()

const id = computed(() => String(route.params.id))
const article = useQuery(() => id.value, () => getArticle(id.value))
const piece = computed(() => article.data.value)

const blocks = computed(() =>
  (piece.value?.body ?? []).map((text) =>
    text.startsWith('## ') ? { heading: true, text: text.slice(3) } : { heading: false, text },
  ),
)

const byAuthor = useQuery(
  () => piece.value?.authorId,
  async () => (piece.value ? (await listArticles(0, { authorId: piece.value.authorId })).items : []),
)
const moreFromAuthor = computed(() => (byAuthor.data.value ?? []).filter((a) => a.id !== id.value))

const colours = computed(() => (piece.value ? articleCategoryColours[piece.value.category] : undefined))

watchEffect(() => {
  if (piece.value) document.title = `${piece.value.title} · Stoa`
})
</script>

<template>
  <main v-if="piece && colours">
    <article>
      <header class="border-b border-white/5" :style="{ backgroundColor: colours.base }">
        <div class="mx-auto max-w-[68ch] px-4 pt-10 pb-8 sm:pt-16">
          <RouterLink
            :to="{ path: '/articles', query: { category: piece.category.toLowerCase() } }"
            class="inline-flex min-h-6 items-center text-xs font-bold tracking-widest uppercase hover:underline"
            :style="{ color: colours.accent }"
          >
            {{ piece.category }}
          </RouterLink>
          <h1 class="mt-3 font-serif text-3xl leading-tight font-bold text-balance sm:text-5xl">{{ piece.title }}</h1>
          <p class="mt-4 text-lg text-white/85 sm:text-xl">{{ piece.standfirst }}</p>
          <p class="mt-4 text-sm text-white/70">
            <ContributorNames :ids="[piece.authorId]" /> · {{ piece.readMin }} min read · {{ formatPublished(piece.publishedAt) }}
          </p>
          <p v-if="piece.views !== undefined" class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/70 [&_svg]:size-4">
            <span class="inline-flex items-center gap-1"><AppIcon name="eye" /> {{ formatCount(piece.views) }} views</span>
            <span class="inline-flex items-center gap-1"><AppIcon name="chat" /> {{ formatCount(piece.comments ?? 0) }} comments</span>
            <span>{{ formatCount(piece.likes ?? 0) }} likes · {{ formatCount(piece.dislikes ?? 0) }} dislikes</span>
          </p>
        </div>
      </header>

      <div class="mx-auto max-w-[68ch] px-4 py-8 font-serif text-lg leading-relaxed text-white/90">
        <template v-for="(block, i) in blocks" :key="i">
          <h2 v-if="block.heading" class="mt-8 mb-3 font-sans text-xl font-semibold text-white">{{ block.text }}</h2>
          <p v-else class="mb-5">{{ block.text }}</p>
        </template>
      </div>
    </article>

    <div class="mx-auto max-w-[68ch] space-y-8 px-4">
      <ReadingList :items="piece.readingList" context="article" />

      <section aria-labelledby="watch-next">
        <h2 id="watch-next" class="text-lg font-semibold">Watch next</h2>
        <p class="text-sm text-muted">An episode on the same subject</p>
        <EpisodeCard :episode="piece.watchNext" :locked="!canWatch(piece.watchNext)" fluid class="mt-4 max-w-sm" />
      </section>
    </div>

    <ContentRow
      v-if="moreFromAuthor.length"
      :title="`More from ${hostNames([piece.authorId])}`"
      class="mt-12"
    >
      <ArticleCard v-for="a in moreFromAuthor" :key="a.id" :article="a" />
    </ContentRow>
  </main>

  <main v-else-if="article.loading.value" class="mx-auto min-h-[60vh] max-w-[68ch] px-4 pt-16" aria-busy="true">
    <div class="h-4 w-24 rounded bg-surface" />
    <div class="mt-4 h-10 w-4/5 rounded bg-surface" />
    <div class="mt-3 h-10 w-3/5 rounded bg-surface" />
  </main>

  <main v-else-if="article.error.value" class="mx-auto max-w-xl px-4 pt-16 text-center" role="alert">
    <p>This article could not load.</p>
    <button type="button" class="mt-3 min-h-6 font-semibold underline" @click="article.reload()">Try again</button>
  </main>

  <main v-else class="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
    <h1 class="font-serif text-4xl font-bold">Article not found</h1>
    <p class="mt-3 text-muted">There is no article at this address.</p>
    <RouterLink to="/articles" class="mt-6 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-ink">All articles</RouterLink>
  </main>
</template>
