<script setup lang="ts">
import { computed } from 'vue'
import CardSkeleton from '@/components/CardSkeleton.vue'
import ContentRow from '@/components/ContentRow.vue'
import EpisodeCard from '@/components/EpisodeCard.vue'
import ShowCard from '@/components/ShowCard.vue'
import { getEpisodes, getHome, getTrending } from '@/api/catalogue'
import { listShows } from '@/data/catalogue'
import { tiers } from '@/data/membership'
import { useQuery } from '@/composables/useQuery'
import { useViewer } from '@/composables/useViewer'
import { useWatchProgress } from '@/composables/useWatchProgress'

// Every show, free ones first. Each card opens the show's page, with its
// full archive, series and filters.
// Members can already watch everything, so for them the page leads with
// what to watch next: continue watching, trending this week and the latest.

const { isMember, user } = useViewer()
const { inProgressIds, progressFor } = useWatchProgress()

const free = listShows().filter((s) => s.access === 'free')
const members = listShows().filter((s) => s.access === 'premium')
const total = listShows().reduce((sum, s) => sum + (s.episodeCount ?? 0), 0)
const tierName = computed(() => tiers.find((t) => t.id === user.value?.tier)?.name ?? '')

// Only fetched for members: the rows are not shown to anyone else.
const continuing = useQuery(
  () => (isMember.value ? inProgressIds.value.join(',') : null),
  async () => (isMember.value ? getEpisodes(inProgressIds.value) : []),
)
const trending = useQuery(
  () => isMember.value,
  async () => (isMember.value ? getTrending() : []),
)
const latest = useQuery(
  () => isMember.value,
  async () => (isMember.value ? (await getHome()).latest.slice(0, 20) : []),
)
</script>

<template>
  <main class="pt-8">
    <div class="px-4 sm:px-8">
      <h1 class="text-3xl font-bold sm:text-4xl">Shows</h1>
      <p v-if="isMember" class="mt-2 max-w-2xl text-white/75">
        Everything is unlocked with your {{ tierName }} membership. Pick up where you left off, see what everyone is watching, or
        browse {{ total.toLocaleString('en-GB') }} episodes across {{ listShows().length }} shows.
      </p>
      <p v-else class="mt-2 max-w-2xl text-white/75">
        {{ listShows().length }} shows and {{ total.toLocaleString('en-GB') }} episodes. Every episode of every show is one click
        away, sorted and filtered the way you want.
      </p>
    </div>

    <div v-if="isMember" class="mt-8 space-y-10">
      <ContentRow v-if="continuing.data.value?.length" title="Continue watching" subtitle="Pick up where you left off">
        <EpisodeCard
          v-for="episode in continuing.data.value"
          :key="episode.id"
          :episode="episode"
          :progress="progressFor(episode.id)"
        />
      </ContentRow>
      <ContentRow title="Trending this week" subtitle="The most watched across every show">
        <CardSkeleton v-if="trending.loading.value" :count="4" />
        <EpisodeCard v-for="episode in trending.data.value ?? []" :key="episode.id" :episode="episode" />
      </ContentRow>
      <ContentRow title="Latest" subtitle="New from every show, newest first">
        <CardSkeleton v-if="latest.loading.value" :count="4" />
        <EpisodeCard v-for="episode in latest.data.value ?? []" :key="episode.id" :episode="episode" />
      </ContentRow>
    </div>

    <section class="mt-10 px-4 sm:px-8" aria-labelledby="free-shows">
      <h2 id="free-shows" class="text-lg font-semibold sm:text-xl">{{ isMember ? 'The daily shows' : 'Free to watch' }}</h2>
      <p v-if="isMember" class="mt-1 text-sm text-muted">Free for everyone, and part of your day.</p>
      <div class="mt-4 grid grid-cols-1 gap-x-4 gap-y-8 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <ShowCard v-for="show in free" :key="show.id" :show="show" />
      </div>
    </section>

    <section class="mt-12 px-4 sm:px-8" aria-labelledby="member-shows">
      <h2 id="member-shows" class="text-lg font-semibold sm:text-xl">{{ isMember ? "Members' shows" : 'For members' }}</h2>
      <p class="mt-1 text-sm text-muted">
        {{ isMember ? `All unlocked with your ${tierName} membership.` : 'Each has free previews, so you can try before you join.' }}
      </p>
      <div class="mt-4 grid grid-cols-1 gap-x-4 gap-y-8 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <ShowCard v-for="show in members" :key="show.id" :show="show" />
      </div>
    </section>
  </main>
</template>
