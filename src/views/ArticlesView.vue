<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter, type LocationQueryRaw } from 'vue-router'
import ArticleCard from '@/components/ArticleCard.vue'
import CardSkeleton from '@/components/CardSkeleton.vue'
import FilterChips from '@/components/FilterChips.vue'
import PageNav from '@/components/PageNav.vue'
import { listArticles } from '@/api/catalogue'
import { articleCategoryColours, hostNames } from '@/data/catalogue'
import { useQuery } from '@/composables/useQuery'
import type { ArticleCategory } from '@/types/content'
import { formatPublished } from '@/utils/format'

// Every article, newest first, 24 to a page. The newest piece leads.
// Category and page live in the address (?category=history&page=2).

const route = useRoute()
const router = useRouter()

const categories: ArticleCategory[] = ['Politics', 'Analysis', 'History', 'Culture', 'Economics']
type Choice = 'all' | ArticleCategory

const category = computed<Choice>(
  () => categories.find((c) => c.toLowerCase() === route.query.category) ?? 'all',
)
const page = computed(() => Math.max(0, (Number(route.query.page) || 1) - 1))

function query(changes: { category?: Choice; page?: number }): LocationQueryRaw {
  const next = { category: category.value, page: page.value, ...changes }
  return {
    ...(next.category !== 'all' ? { category: next.category.toLowerCase() } : {}),
    ...(next.page > 0 ? { page: String(next.page + 1) } : {}),
  }
}
const categoryModel = computed({
  get: () => category.value,
  set: (value: Choice) => router.push({ query: query({ category: value, page: 0 }) }),
})
const options = [{ value: 'all' as Choice, label: 'All' }, ...categories.map((c) => ({ value: c as Choice, label: c }))]

const articles = useQuery(
  () => `${category.value}|${page.value}`,
  () => listArticles(page.value, { category: category.value === 'all' ? undefined : category.value }),
)

// The newest piece leads on the first page; the rest fill the grid.
const lead = computed(() => (page.value === 0 ? articles.data.value?.items[0] : undefined))
const rest = computed(() => (articles.data.value?.items ?? []).slice(lead.value ? 1 : 0))
</script>

<template>
  <main class="px-4 pt-8 sm:px-8">
    <h1 class="text-3xl font-bold sm:text-4xl">Articles</h1>
    <p class="mt-2 max-w-2xl text-white/75">Written pieces from the presenters, each ending with its sources. Free to read.</p>

    <FilterChips v-model="categoryModel" label="Category" :options="options" class="mt-6" />

    <div v-if="articles.error.value" class="mt-6 rounded-lg bg-surface p-4 text-sm ring-1 ring-white/10" role="alert">
      Articles could not load.
      <button type="button" class="ml-2 min-h-6 font-semibold underline" @click="articles.reload()">Try again</button>
    </div>

    <RouterLink
      v-if="lead"
      :to="`/articles/${lead.id}`"
      class="group mt-6 grid overflow-hidden rounded-xl ring-1 ring-white/10 outline-none hover:ring-white/30 focus-visible:ring-2 focus-visible:ring-accent-bright md:grid-cols-2"
      :style="{ backgroundColor: articleCategoryColours[lead.category].base }"
    >
      <div class="relative min-h-44 p-5 sm:p-8">
        <div class="absolute inset-y-0 left-0 w-2" :style="{ backgroundColor: articleCategoryColours[lead.category].accent }" />
        <span
          class="pointer-events-none absolute top-0 right-4 font-serif text-[9rem] leading-none font-bold opacity-20 select-none"
          :style="{ color: articleCategoryColours[lead.category].accent }"
          aria-hidden="true"
        >&ldquo;</span>
        <p class="text-xs font-bold tracking-widest uppercase" :style="{ color: articleCategoryColours[lead.category].accent }">
          Latest · {{ lead.category }}
        </p>
        <h2 class="relative mt-3 font-serif text-2xl leading-tight font-bold text-balance sm:text-4xl">{{ lead.title }}</h2>
      </div>
      <div class="flex flex-col justify-end bg-black/25 p-5 sm:p-8">
        <p class="text-lg text-white/90">{{ lead.standfirst }}</p>
        <p class="mt-3 text-sm text-white/70">
          {{ hostNames([lead.authorId]) }} · {{ lead.readMin }} min read · {{ formatPublished(lead.publishedAt) }}
        </p>
        <span class="mt-4 text-sm font-semibold text-white underline decoration-white/40 underline-offset-4 group-hover:decoration-white">
          Read the article
        </span>
      </div>
    </RouterLink>

    <div class="mt-8 grid grid-cols-1 gap-x-4 gap-y-8 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <CardSkeleton v-if="articles.loading.value && !articles.data.value" :count="8" fluid />
      <ArticleCard v-for="article in rest" v-else :key="article.id" :article="article" fluid />
    </div>

    <PageNav
      v-if="articles.data.value"
      class="mt-10"
      :page="page"
      :page-count="articles.data.value.pageCount"
      :to="(p) => ({ query: query({ page: p }) })"
    />
  </main>
</template>
