<script setup lang="ts">
import BuyEpisodeDialog from '@/components/BuyEpisodeDialog.vue'
import ContributorNames from '@/components/ContributorNames.vue'
import { computed, onUnmounted, ref, watch, watchEffect } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import PitchNote from '@/components/PitchNote.vue'
import CommentSection from '@/components/CommentSection.vue'
import ContentRow from '@/components/ContentRow.vue'
import EpisodeCard from '@/components/EpisodeCard.vue'
import LiveChat from '@/components/LiveChat.vue'
import ReadingList from '@/components/ReadingList.vue'
import SeriesQueue from '@/components/SeriesQueue.vue'
import TitleCard from '@/components/TitleCard.vue'
import { getEpisode, listEpisodes } from '@/api/catalogue'
import { getSeries, getShow, seriesOf } from '@/data/catalogue'
import { useQuery } from '@/composables/useQuery'
import { usePlayback } from '@/composables/usePlayback'
import { useViewer } from '@/composables/useViewer'
import { useWatchProgress } from '@/composables/useWatchProgress'
import { artForEpisode } from '@/data/media'
import { EPISODE_PRICE } from '@/data/membership'
import { formatDuration, formatPrice, formatPublished, toRoman } from '@/utils/format'

// An episode page. Series episodes get the series queue beside the
// player, and when a part ends the next one plays after a short
// countdown, unless autoplay is off. The player is a placeholder here;
// on a real site this is where their own video player would sit.

const UP_NEXT_SECONDS = 8

const route = useRoute()
const router = useRouter()
const { canWatch, isSignedIn } = useViewer()
const { progressFor, setProgress, markWatched } = useWatchProgress()
const { autoplay, finishSignal } = usePlayback()

// Fetched by id: the page holding it is worked out from the id (see src/api/catalogue.ts).
const episodeQuery = useQuery(() => route.params.id, () => getEpisode(String(route.params.id)))
const episode = computed(() => episodeQuery.data.value)
const show = computed(() => (episode.value ? getShow(episode.value.showId) : undefined))
const series = computed(() => {
  const fromLink = route.query.series ? getSeries(String(route.query.series)) : undefined
  return fromLink ?? (episode.value ? seriesOf(episode.value) : undefined)
})
const locked = computed(() => !!episode.value && !canWatch(episode.value))
const buying = ref(false)

const partIndex = computed(() =>
  series.value && episode.value ? series.value.episodes.findIndex((e) => e.id === episode.value!.id) : -1,
)
const nextPart = computed(() => (series.value ? series.value.episodes[partIndex.value + 1] : undefined))

// Shows streamed live keep their chat: a replay beside the recording.
const chatOpen = ref(false)
const hasChatReplay = computed(() => !!show.value?.streamedLive && !locked.value)
const showQueue = computed(() => !!series.value && partIndex.value >= 0)
const sideColumn = computed(() => showQueue.value || (hasChatReplay.value && chatOpen.value))

// The first page of the same show: 50 episodes, of which we show 10.
const showPage = useQuery(
  () => show.value?.id,
  () => (show.value ? listEpisodes(show.value.id, 0) : Promise.resolve(undefined)),
)
const moreFromShow = computed(() =>
  (showPage.data.value?.items ?? []).filter((e) => e.id !== episode.value?.id).slice(0, 10),
)

// End of an episode: the up-next card, with its countdown.
const ended = ref(false)
const secondsLeft = ref(UP_NEXT_SECONDS)
const counting = ref(false)
let timer: ReturnType<typeof setInterval> | undefined

function stopCountdown() {
  clearInterval(timer)
  timer = undefined
  counting.value = false
}

function playNext() {
  stopCountdown()
  if (!nextPart.value || !series.value) return
  router.push({ path: `/watch/${nextPart.value.id}`, query: { series: series.value.slug } })
}

function cancelNext() {
  stopCountdown()
  ended.value = false
}

function finish() {
  if (!episode.value || locked.value) return
  markWatched(episode.value.id)
  ended.value = true
  secondsLeft.value = UP_NEXT_SECONDS
  stopCountdown()
  if (autoplay.value && nextPart.value && canWatch(nextPart.value)) {
    counting.value = true
    timer = setInterval(() => {
      secondsLeft.value--
      if (secondsLeft.value <= 0) playNext()
    }, 1000)
  }
}

watch(finishSignal, finish)

// A new episode: reset the end card and count it as started.
watch(
  () => episode.value?.id,
  () => {
    stopCountdown()
    ended.value = false
    chatOpen.value = false
    const current = episode.value
    if (current && !locked.value && progressFor(current.id) === 0) setProgress(current.id, 0.05)
  },
  { immediate: true },
)

onUnmounted(stopCountdown)

watchEffect(() => {
  if (episode.value) document.title = `${episode.value.title} · Stoa`
})
</script>

<template>
  <main v-if="episode && show">
    <div
      class="lg:grid lg:items-start lg:gap-x-6 lg:px-8 lg:pt-6"
      :class="sideColumn ? 'lg:grid-cols-[minmax(0,1fr)_360px]' : 'lg:grid-cols-1'"
    >
      <div>
        <!-- The player. -->
        <div class="relative aspect-video w-full overflow-hidden bg-black lg:rounded-xl">
          <TitleCard
            :show="show"
            :art="artForEpisode(episode)"
            :show-text="false"
            size="hero"
            :animated="!locked && !ended"
            :class="locked ? 'scale-110 blur-xl brightness-75' : ''"
          />

          <div v-if="locked" class="absolute inset-0 grid place-items-center px-4 text-center">
            <div>
              <!-- Phones: compact, so everything fits in a 16:9 frame 320px wide. -->
              <span class="mx-auto grid size-12 place-items-center rounded-full bg-black/55 ring-1 ring-white/20 max-sm:hidden">
                <AppIcon name="lock" />
              </span>
              <p class="text-base font-semibold sm:mt-3 sm:text-2xl">This episode is for members</p>
              <!-- Two ways in: join for everything, or buy just this one. -->
              <div class="mt-2 flex flex-wrap justify-center gap-2 sm:mt-4 sm:gap-3">
                <RouterLink
                  to="/join"
                  class="inline-flex items-center gap-2 rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold sm:px-5 sm:py-2.5 sm:text-sm text-ink hover:brightness-110 [&>svg]:size-4"
                >
                  <AppIcon name="crown" />
                  Upgrade to watch everything
                </RouterLink>
                <button
                  v-if="isSignedIn"
                  type="button"
                  class="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold sm:px-5 sm:py-2.5 sm:text-sm ring-1 ring-white/20 backdrop-blur hover:bg-white/25"
                  @click="buying = true"
                >
                  Buy this episode, {{ formatPrice(EPISODE_PRICE) }}
                </button>
                <RouterLink
                  v-else
                  to="/sign-in"
                  class="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold sm:px-5 sm:py-2.5 sm:text-sm ring-1 ring-white/20 backdrop-blur hover:bg-white/25"
                >
                  Sign in to buy, {{ formatPrice(EPISODE_PRICE) }}
                </RouterLink>
              </div>
              <PitchNote id="buy-episode" class="mt-2 sm:mt-3" />
              <BuyEpisodeDialog v-if="episode" v-model="buying" :episode="episode" />
            </div>
          </div>

          <div v-else-if="!ended" class="absolute inset-0 grid place-items-center px-4 text-center">
            <div>
              <p class="font-serif text-2xl font-bold sm:text-4xl">{{ show.name }}</p>
              <p class="mt-2 text-[11px] tracking-widest text-white/70 uppercase">Placeholder video</p>
            </div>
          </div>

          <!-- Up next, once the episode ends. -->
          <div
            v-else
            class="absolute inset-0 grid place-items-center bg-black/70 px-4 text-center"
            role="status"
          >
            <div v-if="nextPart && canWatch(nextPart)">
              <p class="text-xs font-semibold tracking-widest text-accent-bright uppercase">Up next</p>
              <p class="mt-2 text-lg font-semibold sm:text-2xl">
                Part {{ toRoman(nextPart.series!.part) }}: {{ nextPart.title }}
              </p>
              <p v-if="counting" class="mt-1 text-sm text-white/75 tabular-nums">
                Playing in {{ secondsLeft }}s
              </p>
              <div class="mt-4 flex justify-center gap-2">
                <button
                  type="button"
                  class="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-ink"
                  @click="playNext"
                >
                  <AppIcon name="play" />
                  Play now
                </button>
                <button
                  type="button"
                  class="rounded-lg bg-white/15 px-5 py-2.5 text-sm font-semibold hover:bg-white/25"
                  @click="cancelNext"
                >
                  Cancel
                </button>
              </div>
            </div>
            <div v-else-if="series">
              <p class="text-lg font-semibold sm:text-2xl">You've finished {{ series.name }}</p>
              <RouterLink
                :to="`/series/${series.slug}`"
                class="mt-4 inline-block rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-ink"
              >
                Back to the series
              </RouterLink>
            </div>
            <div v-else>
              <p class="text-lg font-semibold sm:text-2xl">Thanks for watching</p>
              <button
                type="button"
                class="mt-4 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-ink"
                @click="ended = false"
              >
                Close
              </button>
            </div>
          </div>
        </div>

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

      <SeriesQueue
        v-if="series && partIndex >= 0"
        :series="series"
        :current-id="episode.id"
        class="mt-6 lg:mt-0"
      />
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
    <h1 class="font-serif text-4xl font-bold">{{ episodeQuery.error.value ? 'Could not load this episode' : 'Episode not found' }}</h1>
    <button v-if="episodeQuery.error.value" type="button" class="mt-4 underline" @click="episodeQuery.reload()">Try again</button>
    <RouterLink to="/" class="mt-6 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-ink">Back to home</RouterLink>
  </main>
</template>
