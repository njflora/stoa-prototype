<script setup lang="ts">
import ContributorNames from '@/components/ContributorNames.vue'
import EpisodeGate from '@/components/EpisodeGate.vue'
import UpNextCard from '@/components/UpNextCard.vue'
import { computed, ref, watch, watchEffect } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import PitchNote from '@/pitch/PitchNote.vue'
import CommentSection from '@/components/CommentSection.vue'
import ContentRow from '@/components/ContentRow.vue'
import EpisodeCard from '@/components/EpisodeCard.vue'
import LiveChat from '@/components/LiveChat.vue'
import ReadingList from '@/components/ReadingList.vue'
import SeriesQueue from '@/components/SeriesQueue.vue'
import SourcePlayer from '@/components/SourcePlayer.vue'
import TitleCard from '@/components/TitleCard.vue'
import { getEpisode, listEpisodes } from '@/api/catalogue'
import { getPlay } from '@/api/discussion'
import { getSeries, getShow, seriesOf } from '@/data/catalogue'
import { useQuery } from '@/composables/useQuery'
import { usePlayback } from '@/composables/usePlayback'
import { useUpNext } from '@/composables/useUpNext'
import { useViewer } from '@/composables/useViewer'
import { useWatchProgress } from '@/composables/useWatchProgress'
import { artForEpisode } from '@/data/media'
import { formatDuration, formatPublished, toRoman } from '@/utils/format'
import { pageTitle } from '@/config/brand'

// An episode page. The player offers every platform the episode is on
// (Rumble, Odysee, BitChute and the site's own VOD). Series episodes get
// the series queue beside the player, and when a part ends the next one
// plays after a short countdown, unless autoplay is off.

const route = useRoute()
const router = useRouter()
const { viewer, canWatch, isSignedIn } = useViewer()
const { progressFor, setProgress, markWatched } = useWatchProgress()
const { autoplay, finishSignal } = usePlayback()

// Fetched by id: the page holding it is worked out from the id (see src/api/catalogue.ts).
const episodeQuery = useQuery(
  () => route.params.id,
  () => getEpisode(String(route.params.id)),
)
const episode = computed(() => episodeQuery.data.value)
const show = computed(() => (episode.value ? getShow(episode.value.showId) : undefined))
const series = computed(() => {
  const fromLink = route.query.series ? getSeries(String(route.query.series)) : undefined
  return fromLink ?? (episode.value ? seriesOf(episode.value) : undefined)
})
const locked = computed(() => !!episode.value && !canWatch(episode.value))

// Where to watch it: asked only when the viewer may watch, and again when
// that changes (a purchase, or a different viewer).
const play = useQuery(
  () => `${episode.value?.id}|${viewer.value}|${locked.value}`,
  async () => (episode.value && !locked.value ? getPlay(episode.value.id) : null),
)
const sources = computed(() => (play.data.value && !play.data.value.locked ? play.data.value.sources : []))

const partIndex = computed(() =>
  series.value && episode.value ? series.value.episodes.findIndex((e) => e.id === episode.value!.id) : -1,
)
const nextPart = computed(() => (series.value ? series.value.episodes[partIndex.value + 1] : undefined))

// Shows streamed live keep their chat: a replay beside the recording.
const chatOpen = ref(false)
const showQueue = computed(() => !!series.value && partIndex.value >= 0)
// The replay and the series queue share the side column, so the queue wins.
const hasChatReplay = computed(() => !!show.value?.streamedLive && !locked.value && !showQueue.value)
const sideColumn = computed(() => showQueue.value || (hasChatReplay.value && chatOpen.value))

// The first page of the same show: 50 episodes, of which we show 10.
const showPage = useQuery(
  () => show.value?.id,
  () => (show.value ? listEpisodes(show.value.id, 0) : Promise.resolve(undefined)),
)
const moreFromShow = computed(() =>
  (showPage.data.value?.items ?? []).filter((e) => e.id !== episode.value?.id).slice(0, 10),
)

// End of an episode: the up-next card. The next part plays after a
// countdown, if autoplay is on and this viewer may watch it.
const watchableNext = computed(() => (nextPart.value && canWatch(nextPart.value) ? nextPart.value : undefined))
const { ended, secondsLeft, counting, end, next, dismiss } = useUpNext(() => {
  if (!nextPart.value || !series.value) return
  void router.push({ path: `/watch/${nextPart.value.id}`, query: { series: series.value.slug } })
})

watch(finishSignal, () => {
  if (!episode.value || locked.value) return
  markWatched(episode.value.id)
  end(autoplay.value && !!watchableNext.value)
})

// A new episode: no end card, and it counts as started.
watch(
  () => episode.value?.id,
  () => {
    dismiss()
    chatOpen.value = false
    const current = episode.value
    if (current && !locked.value && progressFor(current.id) === 0) setProgress(current.id, 0.05)
  },
  { immediate: true },
)

watchEffect(() => {
  if (episode.value) document.title = pageTitle(episode.value.title)
})
</script>

<template>
  <main v-if="episode && show">
    <div
      class="lg:grid lg:items-start lg:justify-center lg:gap-x-6 lg:px-8 lg:pt-6"
      :class="
        sideColumn
          ? 'lg:grid-cols-[minmax(0,var(--player-max-w))_360px]'
          : 'lg:grid-cols-[minmax(0,var(--player-max-w))]'
      "
    >
      <div>
        <!-- The player: every platform this episode is on, in one frame. -->
        <SourcePlayer
          v-if="!locked"
          :key="episode.id"
          :show="show"
          :title="episode.title"
          :sources="sources"
          :mode="episode.live ? 'recording' : 'episode'"
        >
          <template #placeholder>
            <TitleCard :show="show" :art="artForEpisode(episode)" :show-text="false" size="hero" :animated="!ended" />
          </template>
          <template v-if="ended" #overlay>
            <UpNextCard
              :next="watchableNext"
              :series="series"
              :counting="counting"
              :seconds-left="secondsLeft"
              @play="next"
              @dismiss="dismiss"
            />
          </template>
        </SourcePlayer>

        <!-- Members only: the artwork, blurred, and two ways in. -->
        <EpisodeGate v-else :show="show" :episode="episode" />

        <!-- About this episode. -->
        <div class="px-4 pt-4 lg:px-0">
          <p class="font-serif text-sm font-bold tracking-widest text-white/70 uppercase">{{ show.name }}</p>
          <h1 class="mt-1 text-2xl leading-tight font-bold sm:text-3xl">{{ episode.title }}</h1>
          <p class="mt-1 text-sm text-muted">
            <ContributorNames :ids="episode.hostIds" /> · {{ formatPublished(episode.publishedAt) }} ·
            {{ formatDuration(episode.durationMin) }}
          </p>
          <RouterLink
            v-if="series && partIndex >= 0"
            :to="`/series/${series.slug}`"
            class="mt-2 inline-flex min-h-6 items-center text-sm font-medium text-accent-bright hover:underline"
          >
            Part {{ toRoman(partIndex + 1) }} of {{ toRoman(series.episodes.length) }} · {{ series.name }}
          </RouterLink>
          <div v-if="hasChatReplay">
            <button
              type="button"
              class="mt-3 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ring-1 transition [&>svg]:size-4"
              :class="chatOpen ? 'bg-accent text-white ring-accent' : 'bg-surface ring-white/10 hover:bg-raised'"
              :aria-expanded="chatOpen"
              aria-controls="chat-replay"
              @click="chatOpen = !chatOpen"
            >
              <AppIcon name="chat" />
              {{ chatOpen ? 'Hide chat replay' : 'Live chat replay' }}
            </button>
            <PitchNote id="chat-replay" class="ml-2 align-middle" />
          </div>
        </div>
      </div>

      <LiveChat
        v-if="hasChatReplay && chatOpen && !showQueue"
        id="chat-replay"
        :key="`chat-${episode.id}`"
        mode="replay"
        :start-at="0"
        :length-seconds="episode.durationMin * 60"
        autoplay
        :signed-in="isSignedIn"
        class="mx-4 mt-6 h-[440px] rounded-xl ring-1 ring-white/10 lg:sticky lg:top-[calc(var(--header-h,4rem)+1.5rem)] lg:mx-0 lg:mt-0 lg:h-[calc(100svh-var(--header-h,4rem)-3rem)]"
      />

      <SeriesQueue v-if="series && partIndex >= 0" :series="series" :current-id="episode.id" class="mt-6 lg:mt-0" />
    </div>

    <!-- Same as the live page: phones get the reading list first, large
         screens put comments on the left and the reading list on the right.
         Keyed by episode, so both refresh when autoplay moves on. -->
    <div
      class="flex flex-col gap-10 px-4 pt-10 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-x-6 lg:px-8"
    >
      <!-- Open to every account on the free daily shows, members only elsewhere (the server decides). -->
      <ReadingList
        :key="`reading-${episode.id}`"
        :thread="{ type: 'episode', id: episode.id }"
        class="lg:col-start-2 lg:row-start-1"
      />
      <CommentSection
        :key="`comments-${episode.id}`"
        :thread="{ type: 'episode', id: episode.id }"
        class="lg:col-start-1 lg:row-start-1"
      />
    </div>

    <ContentRow v-if="moreFromShow.length" :title="`More from ${show.name}`" class="pt-10">
      <EpisodeCard
        v-for="e in moreFromShow"
        :key="e.id"
        :episode="e"
        :locked="!canWatch(e)"
        :progress="progressFor(e.id)"
      />
    </ContentRow>
  </main>

  <main v-else-if="episodeQuery.loading.value" class="px-4 pt-0 lg:px-8 lg:pt-6" aria-busy="true">
    <div class="aspect-video w-full bg-surface lg:rounded-xl" />
    <div class="mt-4 h-7 w-2/3 rounded bg-surface" />
    <div class="mt-2 h-4 w-1/3 rounded bg-surface" />
    <span class="sr-only">Loading the episode</span>
  </main>

  <main v-else class="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
    <h1 class="font-serif text-4xl font-bold">
      {{ episodeQuery.error.value ? 'Could not load this episode' : 'Episode not found' }}
    </h1>
    <button v-if="episodeQuery.error.value" type="button" class="mt-4 underline" @click="episodeQuery.reload()">
      Try again
    </button>
    <RouterLink to="/" class="mt-6 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-ink"
      >Back to home</RouterLink
    >
  </main>
</template>
