<script setup lang="ts">
import { computed, nextTick, ref, watch, watchEffect } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import ArticleCard from '@/components/ArticleCard.vue'
import CardSkeleton from '@/components/CardSkeleton.vue'
import ContentRow from '@/components/ContentRow.vue'
import EpisodeCard from '@/components/EpisodeCard.vue'
import PageNav from '@/components/PageNav.vue'
import SeriesCard from '@/components/SeriesCard.vue'
import { listArticles, listEpisodesByHost, reference } from '@/api/catalogue'
import { listAllSeries } from '@/data/catalogue'
import { useQuery } from '@/composables/useQuery'
import { useViewer } from '@/composables/useViewer'

// A contributor's profile: who they are, the shows they appear on (each
// opening that show filtered to them), their series and articles, and
// every episode they are in, newest first, 50 to a page.

const route = useRoute()
const { canWatch } = useViewer()

const person = computed(() => reference.hosts.find((h) => h.id === route.params.id))
const shows = computed(() => reference.shows.filter((s) => person.value?.showIds?.includes(s.id)))
const series = computed(() =>
  listAllSeries().filter((s) => s.episodes.some((e) => e.hostIds.includes(person.value?.id ?? ''))),
)
/** A show's page, filtered to this person when the show has more than one presenter. */
function showLink(showId: string) {
  const many = reference.hosts.filter((h) => h.showIds?.includes(showId)).length > 1
  return { path: `/shows/${showId}`, query: many ? { host: person.value!.id } : {} }
}
const initials = computed(() => person.value?.name.split(' ').map((w) => w[0]).join('').slice(0, 2))

const page = computed(() => Math.max(0, (Number(route.query.page) || 1) - 1))
const episodes = useQuery(
  () => `${person.value?.id}|${page.value}`,
  () => listEpisodesByHost(person.value!.id, page.value),
)
const articles = useQuery(
  () => person.value?.id,
  async () => (person.value?.articleCount ? (await listArticles(0, { authorId: person.value.id })).items : []),
)

const listTop = ref<HTMLElement>()
watch(page, async () => {
  await nextTick()
  listTop.value?.scrollIntoView({ block: 'start' })
})

watchEffect(() => {
  if (person.value) document.title = `${person.value.name} · Stoa`
})
</script>

<template>
  <main v-if="person">
    <section class="border-b border-white/5 bg-surface/60">
      <div class="flex max-w-4xl flex-col gap-5 px-4 pt-10 pb-8 sm:flex-row sm:items-center sm:px-8">
        <span class="grid size-24 shrink-0 place-items-center rounded-full bg-accent text-3xl font-bold">{{ initials }}</span>
        <div>
          <RouterLink to="/contributors" class="inline-flex min-h-6 items-center text-sm text-white/70 hover:text-white">All contributors</RouterLink>
          <h1 class="text-3xl font-bold sm:text-4xl">{{ person.name }}</h1>
          <p class="mt-1 text-white/80">{{ person.role }}</p>
          <p class="mt-1 text-sm text-muted">
            {{ (person.episodeCount ?? 0).toLocaleString('en-GB') }} episodes<template v-if="person.articleCount">
              · {{ person.articleCount }} {{ person.articleCount === 1 ? 'article' : 'articles' }}</template>
          </p>
        </div>
      </div>
      <p class="max-w-3xl px-4 pb-8 text-white/85 sm:px-8">{{ person.bio }}</p>
    </section>

    <section class="px-4 pt-8 sm:px-8" aria-labelledby="appears-on">
      <h2 id="appears-on" class="text-lg font-semibold">Appears on</h2>
      <ul class="mt-3 flex flex-wrap gap-2">
        <li v-for="show in shows" :key="show.id">
          <RouterLink
            :to="showLink(show.id)"
            class="inline-flex min-h-9 items-center rounded-full bg-surface px-4 text-sm ring-1 ring-white/10 hover:bg-raised"
          >
            {{ show.name }}
          </RouterLink>
        </li>
      </ul>
    </section>

    <ContentRow v-if="series.length" title="Series" :subtitle="`${series.length} series with ${person.name}`" class="mt-10">
      <SeriesCard v-for="s in series" :key="s.slug" :series="s" />
    </ContentRow>

    <ContentRow v-if="articles.data.value?.length" title="Articles" class="mt-10">
      <ArticleCard v-for="a in articles.data.value" :key="a.id" :article="a" />
    </ContentRow>

    <section class="mt-10 px-4 sm:px-8" aria-labelledby="their-episodes">
      <h2 id="their-episodes" ref="listTop" class="scroll-mt-[calc(var(--header-h)+1rem)] text-lg font-semibold">
        Episodes with {{ person.name }}
      </h2>
      <div v-if="episodes.error.value" class="mt-4 rounded-lg bg-surface p-4 text-sm ring-1 ring-white/10" role="alert">
        These episodes could not load.
        <button type="button" class="ml-2 min-h-6 font-semibold underline" @click="episodes.reload()">Try again</button>
      </div>
      <div class="mt-4 grid grid-cols-1 gap-x-4 gap-y-8 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <CardSkeleton v-if="episodes.loading.value && !episodes.data.value" :count="8" fluid />
        <EpisodeCard
          v-for="episode in episodes.data.value?.items ?? []"
          v-else
          :key="episode.id"
          :episode="episode"
          :locked="!canWatch(episode)"
          fluid
        />
      </div>
      <PageNav
        v-if="episodes.data.value"
        class="mt-10"
        :page="page"
        :page-count="episodes.data.value.pageCount"
        :to="(p) => ({ query: p > 0 ? { page: String(p + 1) } : {} })"
      />
    </section>
  </main>

  <main v-else class="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
    <h1 class="font-serif text-4xl font-bold">Contributor not found</h1>
    <RouterLink to="/contributors" class="mt-6 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-ink">All contributors</RouterLink>
  </main>
</template>
