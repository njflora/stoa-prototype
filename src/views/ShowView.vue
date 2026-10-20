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
import { listEpisodes, reference, type AccessFilter, type Period, type SortOrder } from '@/api/catalogue'
import { listAllSeries } from '@/data/catalogue'
import { useQuery } from '@/composables/useQuery'
import { useSearchOverlay } from '@/composables/useSearchOverlay'
import { useViewer } from '@/composables/useViewer'

// One show: its header, its series, and every episode it has made,
// 50 to a page, sorted and filtered (Finding 3). Sort by newest, oldest or
// most watched in a period; filter by access and by contributor. All of it
// lives in the address (?sort=popular&period=month&host=gary), so Back and
// shared links land on the same view.

const route = useRoute()
const router = useRouter()
const { isMember, canWatch } = useViewer()
const { openSearch } = useSearchOverlay()

const show = computed(() => reference.shows.find((s) => s.id === route.params.id))

// Mixed shows (members' shows with free previews) can be filtered by access.
const mixed = computed(() => !!show.value?.freeCount && !!show.value?.membersCount)

// Everyone who has appeared on the show. With two or more, the archive
// can be filtered by contributor.
const contributors = computed(() => reference.hosts.filter((h) => h.showIds?.includes(show.value?.id ?? '')))
const filterable = computed(() => contributors.value.length > 1)

// Read the view from the address. Pages count from 1 there, and from 0 in the API.
const periods: Period[] = ['week', 'month', 'year', 'all']
const sort = computed<SortOrder>(() =>
  route.query.sort === 'oldest' || route.query.sort === 'popular' ? route.query.sort : 'newest',
)
const period = computed<Period>(() => periods.find((p) => p === route.query.period) ?? 'month')
const access = computed<AccessFilter>(() => {
  const value = route.query.access
  return mixed.value && (value === 'free' || value === 'members') ? value : 'all'
})
const host = computed(() =>
  filterable.value ? contributors.value.find((h) => h.id === route.query.host)?.id ?? 'all' : 'all',
)
const page = computed(() => Math.max(0, (Number(route.query.page) || 1) - 1))

type View = { page: number; sort: SortOrder; period: Period; access: AccessFilter; host: string }
function query(changes: Partial<View>): LocationQueryRaw {
  const next: View = { page: page.value, sort: sort.value, period: period.value, access: access.value, host: host.value, ...changes }
  return {
    ...(next.page > 0 ? { page: String(next.page + 1) } : {}),
    ...(next.sort !== 'newest' ? { sort: next.sort } : {}),
    ...(next.sort === 'popular' && next.period !== 'month' ? { period: next.period } : {}),
    ...(next.access !== 'all' ? { access: next.access } : {}),
    ...(next.host !== 'all' ? { host: next.host } : {}),
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
const periodModel = computed({
  get: () => period.value,
  set: (value: Period) => router.push({ query: query({ period: value, page: 0 }) }),
})
const hostModel = computed({
  get: () => host.value,
  set: (value: string) => router.push({ query: query({ host: value, page: 0 }) }),
})

/** Filter by a contributor from the header, then bring the list into view. */
async function filterBy(hostId: string) {
  await router.push({ query: query({ host: hostId, page: 0 }) })
  listTop.value?.scrollIntoView({ block: 'start', behavior: 'smooth' })
}

const episodes = useQuery(
  () => `${show.value?.id}|${page.value}|${sort.value}|${period.value}|${access.value}|${host.value}`,
  () =>
    listEpisodes(show.value!.id, page.value, {
      sort: sort.value,
      period: period.value,
      access: access.value,
      host: host.value === 'all' ? undefined : host.value,
    }),
)
const latest = useQuery(
  () => show.value?.id,
  () => listEpisodes(show.value!.id, 0),
)
const latestEpisode = computed(() => latest.data.value?.items[0])
const locked = computed(() => show.value?.access === 'premium' && !isMember.value)

const series = computed(() => listAllSeries().filter((s) => s.showId === show.value?.id))

const sortOptions: { value: SortOrder; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'popular', label: 'Popular' },
]
const periodLabels: Record<Period, string> = { week: 'This week', month: 'This month', year: 'This year', all: 'All time' }
const periodOptions = periods.map((p) => ({ value: p, label: periodLabels[p] }))
const hostOptions = computed(() => [
  { value: 'all', label: 'Everyone' },
  ...contributors.value.map((h) => ({ value: h.id, label: h.name })),
])
const activeHost = computed(() => contributors.value.find((h) => h.id === host.value))

const heading = computed(() => {
  const base = sort.value === 'popular' ? `Most watched ${period.value === 'all' ? 'of all time' : periodLabels[period.value].toLowerCase()}` : 'All episodes'
  return activeHost.value ? `${base}, with ${activeHost.value.name}` : base
})
const accessOptions = computed(() => [
  { value: 'all' as const, label: 'All', count: show.value?.episodeCount },
  { value: 'free' as const, label: 'Free to watch', count: show.value?.freeCount },
  { value: 'members' as const, label: 'Members', count: show.value?.membersCount },
])

const range = computed(() => {
  const data = episodes.data.value
  if (!data || !data.items.length) return ''
  if (sort.value === 'popular') return `Top ${data.items.length}, by views`
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
          {{ show.episodeCount?.toLocaleString('en-GB') }} episodes<template v-if="show.schedule"> · {{ show.schedule }}</template>
        </p>
        <!-- Clicking a name filters this show's archive to them. -->
        <div v-if="filterable" class="mt-3 flex flex-wrap items-center gap-1.5 text-sm">
          <span class="mr-1 text-white/70">With</span>
          <button
            v-for="h in contributors"
            :key="h.id"
            type="button"
            :aria-pressed="host === h.id"
            class="inline-flex min-h-7 items-center rounded-full px-2.5 font-medium ring-1 backdrop-blur transition"
            :class="host === h.id ? 'bg-accent text-white ring-accent' : 'bg-white/10 text-white/90 ring-white/15 hover:bg-white/20'"
            @click="filterBy(host === h.id ? 'all' : h.id)"
          >
            {{ h.name }}
          </button>
        </div>
        <p v-else-if="contributors[0]" class="mt-2 text-sm text-white/70">
          With
          <RouterLink :to="`/contributors/${contributors[0].id}`" class="font-medium text-white underline decoration-white/30 underline-offset-2 hover:decoration-white">
            {{ contributors[0].name }}
          </RouterLink>
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
        <h2 id="all-episodes" class="text-lg font-semibold sm:text-xl">{{ heading }}</h2>
        <PitchNote id="show-archive" />
      </div>

      <div class="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
        <FilterChips v-model="sortModel" label="Sort" :options="sortOptions" />
        <FilterChips v-if="mixed" v-model="accessModel" label="Show" :options="accessOptions" />
      </div>
      <FilterChips v-if="sort === 'popular'" v-model="periodModel" label="Published" :options="periodOptions" class="mt-3" />
      <div v-if="filterable" class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <FilterChips v-model="hostModel" label="Contributor" :options="hostOptions" scroll class="max-w-full" />
        <RouterLink
          v-if="activeHost"
          :to="`/contributors/${activeHost.id}`"
          class="inline-flex min-h-8 items-center text-sm font-medium text-accent-bright hover:underline"
        >
          View {{ activeHost.name }}'s profile
        </RouterLink>
      </div>
      <p class="mt-3 min-h-5 text-sm text-muted" aria-live="polite">{{ range }}</p>

      <div v-if="episodes.error.value" class="mt-4 rounded-lg bg-surface p-4 text-sm ring-1 ring-white/10" role="alert">
        These episodes could not load.
        <button type="button" class="ml-2 min-h-6 font-semibold underline" @click="episodes.reload()">Try again</button>
      </div>

      <p
        v-if="sort === 'popular' && episodes.data.value && !episodes.data.value.items.length"
        class="mt-4 text-sm text-white/80"
      >
        Nothing published {{ periodLabels[period].toLowerCase() }} with these filters.
        <button type="button" class="ml-1 min-h-6 font-semibold underline" @click="periodModel = 'all'">See all time</button>
      </p>

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
