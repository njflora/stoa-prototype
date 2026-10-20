<script setup lang="ts">
import { computed, nextTick, ref, watch, watchEffect } from 'vue'
import { RouterLink, useRoute, useRouter, type LocationQueryRaw } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import CardSkeleton from '@/components/CardSkeleton.vue'
import ContentRow from '@/components/ContentRow.vue'
import EpisodeCard from '@/components/EpisodeCard.vue'
import FilterChips from '@/components/FilterChips.vue'
import PageNav from '@/components/PageNav.vue'
import PitchNote from '@/components/PitchNote.vue'
import SeriesCard from '@/components/SeriesCard.vue'
import TitleCard from '@/components/TitleCard.vue'
import { listEpisodes, reference, type AccessFilter, type SortOrder } from '@/api/catalogue'
import { hostNames, listAllSeries } from '@/data/catalogue'
import { useQuery } from '@/composables/useQuery'
import { useSearchOverlay } from '@/composables/useSearchOverlay'
import { useViewer } from '@/composables/useViewer'

// One show: its header, its series, and every episode it has made,
// 50 to a page, sorted and filtered (Finding 3). The page, sort and
// filter live in the address (?page=4&sort=oldest&access=free), so
// Back and shared links land on the same view.

const route = useRoute()
const router = useRouter()
const { isMember, canWatch } = useViewer()
const { openSearch } = useSearchOverlay()

const show = computed(() => reference.shows.find((s) => s.id === route.params.id))

// Mixed shows (members' shows with free previews) can be filtered by access.
const mixed = computed(() => !!show.value?.freeCount && !!show.value?.membersCount)

// Read the view from the address. Pages count from 1 there, and from 0 in the API.
const sort = computed<SortOrder>(() => (route.query.sort === 'oldest' ? 'oldest' : 'newest'))
const access = computed<AccessFilter>(() => {
  const value = route.query.access
  return mixed.value && (value === 'free' || value === 'members') ? value : 'all'
})
const page = computed(() => Math.max(0, (Number(route.query.page) || 1) - 1))

function query(changes: { page?: number; sort?: SortOrder; access?: AccessFilter }): LocationQueryRaw {
  const next = { page: page.value, sort: sort.value, access: access.value, ...changes }
  return {
    ...(next.page > 0 ? { page: String(next.page + 1) } : {}),
    ...(next.sort !== 'newest' ? { sort: next.sort } : {}),
    ...(next.access !== 'all' ? { access: next.access } : {}),
  }
}
const pageLink = (p: number) => ({ query: query({ page: p }) })

// Changing sort or filter starts again from page 1, as a new history entry.
const sortModel = computed({
  get: () => sort.value,
  set: (value: SortOrder) => router.push({ query: query({ sort: value, page: 0 }) }),
})
const accessModel = computed({
  get: () => access.value,
  set: (value: AccessFilter) => router.push({ query: query({ access: value, page: 0 }) }),
})

const episodes = useQuery(
  () => `${show.value?.id}|${page.value}|${sort.value}|${access.value}`,
  () => listEpisodes(show.value!.id, page.value, { sort: sort.value, access: access.value }),
)
const latest = useQuery(
  () => show.value?.id,
  () => listEpisodes(show.value!.id, 0),
)
const latestEpisode = computed(() => latest.data.value?.items[0])
const locked = computed(() => show.value?.access === 'premium' && !isMember.value)

const series = computed(() => listAllSeries().filter((s) => s.showId === show.value?.id))

const sortOptions = [
  { value: 'newest' as const, label: 'Newest' },
  { value: 'oldest' as const, label: 'Oldest' },
]
const accessOptions = computed(() => [
  { value: 'all' as const, label: 'All', count: show.value?.episodeCount },
  { value: 'free' as const, label: 'Free to watch', count: show.value?.freeCount },
  { value: 'members' as const, label: 'Members', count: show.value?.membersCount },
])

const range = computed(() => {
  const data = episodes.data.value
  if (!data || !data.items.length) return ''
  const first = page.value * reference.pageSize + 1
  return `${first.toLocaleString('en-GB')} to ${(first + data.items.length - 1).toLocaleString('en-GB')} of ${data.total.toLocaleString('en-GB')}`
})

// After moving to another page, bring the list back into view.
const listTop = ref<HTMLElement>()
watch(page, async () => {
  await nextTick()
  listTop.value?.scrollIntoView({ block: 'start' })
})

watchEffect(() => {
  if (show.value) document.title = `${show.value.name} · Stoa`
})
</script>

<template>
  <main v-if="show">
    <section class="relative min-h-[380px] overflow-hidden">
      <TitleCard :show="show" :show-text="false" size="hero" :animated="!locked" />
      <div class="absolute inset-0 bg-gradient-to-r from-ink via-ink/75 to-ink/20" />
      <div class="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink to-transparent" />

      <div class="relative max-w-2xl px-4 pt-16 pb-10 sm:px-8 sm:pt-24">
        <p class="font-serif text-sm font-bold tracking-widest text-white/70 uppercase">
          {{ show.access === 'free' ? 'Free show' : "Members' show" }}
        </p>
        <h1 class="mt-2 text-3xl leading-tight font-bold text-balance sm:text-5xl">{{ show.name }}</h1>
        <p class="mt-2 text-white/85">{{ show.tagline }}</p>
        <p class="mt-2 text-sm text-white/70">
          {{ hostNames(show.hostIds) }} · {{ show.episodeCount?.toLocaleString('en-GB') }} episodes
          <template v-if="show.schedule"> · {{ show.schedule }}</template>
        </p>

        <div class="mt-6 flex flex-wrap gap-3">
          <RouterLink
            v-if="!locked && latestEpisode"
            :to="`/watch/${latestEpisode.id}`"
            class="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-ink hover:brightness-95"
          >
            <AppIcon name="play" />
            Watch the latest
          </RouterLink>
          <template v-if="locked">
            <RouterLink
              to="/join"
              class="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-ink hover:brightness-110 [&>svg]:size-4"
            >
              <AppIcon name="crown" />
              Upgrade to watch
            </RouterLink>
            <RouterLink
              v-if="show.freePreview"
              :to="`/watch/${show.freePreview.id}`"
              class="inline-flex items-center gap-2 rounded-lg bg-white/15 px-5 py-2.5 text-sm font-semibold backdrop-blur hover:bg-white/25"
            >
              <AppIcon name="play" />
              Watch a free preview
            </RouterLink>
          </template>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-semibold ring-1 ring-white/15 backdrop-blur hover:bg-white/20 [&>svg]:size-4"
            @click="openSearch(show.name)"
          >
            <AppIcon name="search" />
            Search this show
          </button>
        </div>
      </div>
    </section>

    <ContentRow v-if="series.length" title="Series" :subtitle="`${series.length} multi-part series, played in order`" class="mt-2">
      <SeriesCard v-for="s in series" :key="s.slug" :series="s" />
    </ContentRow>

    <section class="mt-10 px-4 sm:px-8" aria-labelledby="all-episodes">
      <div ref="listTop" class="flex flex-wrap items-center gap-2 scroll-mt-[calc(var(--header-h)+1rem)]">
        <h2 id="all-episodes" class="text-lg font-semibold sm:text-xl">All episodes</h2>
        <PitchNote id="show-archive" />
      </div>

      <div class="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
        <FilterChips v-model="sortModel" label="Sort" :options="sortOptions" />
        <FilterChips v-if="mixed" v-model="accessModel" label="Show" :options="accessOptions" />
      </div>
      <p class="mt-3 min-h-5 text-sm text-muted" aria-live="polite">{{ range }}</p>

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
          :class="episodes.loading.value ? 'opacity-60' : ''"
          fluid
        />
      </div>

      <PageNav
        v-if="episodes.data.value"
        class="mt-10"
        :page="page"
        :page-count="episodes.data.value.pageCount"
        :to="pageLink"
      />
    </section>
  </main>

  <main v-else class="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
    <h1 class="font-serif text-4xl font-bold">Show not found</h1>
    <p class="mt-3 text-muted">There is no show at this address.</p>
    <RouterLink to="/shows" class="mt-6 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-ink">All shows</RouterLink>
  </main>
</template>
