<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import ArticleCard from '@/components/ArticleCard.vue'
import CardSkeleton from '@/components/CardSkeleton.vue'
import ContentRow from '@/components/ContentRow.vue'
import EpisodeCard from '@/components/EpisodeCard.vue'
import HeroBanner from '@/components/HeroBanner.vue'
import SeriesCard from '@/components/SeriesCard.vue'
import { getEpisodes, getHome } from '@/api/catalogue'
import { getSeries, getShow, listShows } from '@/data/catalogue'
import type { Series } from '@/types/content'
import { useQuery } from '@/composables/useQuery'
import { useViewer } from '@/composables/useViewer'
import { useWatchProgress } from '@/composables/useWatchProgress'
import { brand } from '@/config/brand'

const { isMember, canWatch } = useViewer()
const { inProgressIds, progressFor } = useWatchProgress()

// One request for everything above the fold and the first page of each row.
const home = useQuery(() => 'home', getHome)

// Continue watching fetches only the episodes it needs, by id.
const continuing = useQuery(
  () => inProgressIds.value.join(','),
  () => getEpisodes(inProgressIds.value),
)
const continueWatching = computed(() => (continuing.data.value ?? []).filter((e) => canWatch(e)))

const startHere = computed(() => home.data.value?.startHere ?? [])
const series = computed(() =>
  (home.data.value?.seriesSlugs ?? []).map(getSeries).filter((s): s is Series => s !== undefined),
)

// Free viewers see what they can watch; members see everything.
const latest = computed(() => (home.data.value?.latest ?? []).filter((e) => canWatch(e)).slice(0, 20))

const premiumShows = listShows().filter((s) => s.access === 'premium')
const rowFor = (showId: string) => home.data.value?.rows[showId] ?? []
</script>

<template>
  <main>
    <h1 class="sr-only">{{ brand.name }}</h1>
    <HeroBanner :featured="home.data.value?.featured ?? []" />

    <div
      v-if="home.error.value"
      class="mx-4 mt-6 rounded-lg bg-surface p-4 text-sm ring-1 ring-white/10 sm:mx-8"
      role="alert"
    >
      The latest episodes could not load.
      <button type="button" class="ml-2 min-h-6 font-semibold underline" @click="home.reload()">Try again</button>
    </div>

    <div class="relative z-10 -mt-6 space-y-10 sm:space-y-12">
      <ContentRow
        v-if="continueWatching.length"
        title="Continue watching"
        pitch="continue-watching"
        subtitle="Pick up where you left off"
      >
        <EpisodeCard
          v-for="episode in continueWatching"
          :key="episode.id"
          :episode="episode"
          :progress="progressFor(episode.id)"
        />
      </ContentRow>

      <ContentRow title="Start here" :subtitle="`New to ${brand.name}? One way into every show`" pitch="start-here">
        <CardSkeleton v-if="home.loading.value" :count="4" />
        <EpisodeCard
          v-for="item in startHere"
          :key="item.showId"
          :episode="item.episode"
          :locked="!canWatch(item.episode)"
          variant="show"
        />
      </ContentRow>

      <ContentRow title="Watch a whole series" subtitle="Multi-part series, played in order" pitch="series-row">
        <SeriesCard v-for="s in series" :key="s.slug" :series="s" />
      </ContentRow>

      <ContentRow
        :title="isMember ? 'Latest' : 'Latest free episodes'"
        pitch="card-previews"
        :subtitle="isMember ? undefined : 'Free shows and free previews from members\' series'"
      >
        <CardSkeleton v-if="home.loading.value" />
        <EpisodeCard
          v-for="episode in latest"
          :key="episode.id"
          :episode="episode"
          :progress="progressFor(episode.id)"
        />
      </ContentRow>

      <ContentRow title="Latest articles" subtitle="Free to read" pitch="latest-articles">
        <template #action>
          <RouterLink
            to="/articles"
            class="inline-flex min-h-6 items-center shrink-0 text-sm text-muted hover:text-white"
          >
            See all
          </RouterLink>
        </template>
        <CardSkeleton v-if="home.loading.value" :count="4" />
        <ArticleCard v-for="article in home.data.value?.articles ?? []" :key="article.id" :article="article" />
      </ContentRow>

      <!-- What free gets, and what joining adds. Free viewers only. -->
      <aside
        v-if="!isMember"
        class="mx-4 flex flex-col gap-4 rounded-xl bg-gradient-to-r from-accent/40 to-surface p-6 ring-1 ring-white/10 sm:mx-8 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p class="text-lg font-semibold">Free gets you the daily shows. Members get everything.</p>
          <p class="mt-1 text-sm text-white/75">
            Full history series, geopolitics, economics and the live panel show, plus the back catalogue.
          </p>
        </div>
        <RouterLink
          to="/join"
          class="shrink-0 self-start rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-ink hover:brightness-110 sm:self-auto"
        >
          See membership
        </RouterLink>
      </aside>

      <ContentRow
        v-for="(show, i) in premiumShows"
        :key="show.id"
        :pitch="i === 0 ? 'members-rows' : undefined"
        :title="show.name"
        :subtitle="`${show.tagline} · ${show.episodeCount?.toLocaleString('en-GB')} episodes`"
      >
        <template #action>
          <RouterLink
            v-if="!isMember"
            to="/join"
            class="inline-flex min-h-6 items-center shrink-0 text-sm font-semibold text-gold hover:underline"
          >
            Unlock {{ show.name }}
          </RouterLink>
          <RouterLink
            v-else
            :to="`/shows/${show.id}`"
            class="inline-flex min-h-6 items-center shrink-0 text-sm text-muted hover:text-white"
          >
            See all
          </RouterLink>
        </template>
        <CardSkeleton v-if="home.loading.value" />
        <EpisodeCard
          v-for="episode in rowFor(show.id)"
          :key="episode.id"
          :episode="episode"
          :locked="!canWatch(episode)"
          :progress="progressFor(episode.id)"
        />
      </ContentRow>

      <ContentRow :title="getShow('conversations').name" subtitle="Long-form interviews, free for everyone">
        <template #action>
          <RouterLink
            to="/shows/conversations"
            class="inline-flex min-h-6 items-center shrink-0 text-sm text-muted hover:text-white"
          >
            See all
          </RouterLink>
        </template>
        <CardSkeleton v-if="home.loading.value" />
        <EpisodeCard
          v-for="episode in rowFor('conversations')"
          :key="episode.id"
          :episode="episode"
          :progress="progressFor(episode.id)"
        />
      </ContentRow>
    </div>
  </main>
</template>
