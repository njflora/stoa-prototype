<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import ArticleCard from '@/components/ArticleCard.vue'
import ContentRow from '@/components/ContentRow.vue'
import EpisodeCard from '@/components/EpisodeCard.vue'
import HeroBanner from '@/components/HeroBanner.vue'
import { articles, episodes, episodesForShow, shows, startHereEpisodes } from '@/data/catalogue'
import { useViewer } from '@/composables/useViewer'
import { useWatchProgress } from '@/composables/useWatchProgress'

const { isMember, canWatch } = useViewer()
const { inProgress, progressFor } = useWatchProgress()

const continueWatching = computed(() => inProgress.value.filter((item) => canWatch(item.episode)))
const startHere = startHereEpisodes()

// Free viewers see what they can watch; members see everything.
const latest = computed(() => episodes.filter((e) => canWatch(e)).slice(0, 16))

const premiumShows = shows.filter((s) => s.access === 'premium')
const conversations = episodesForShow('conversations')
</script>

<template>
  <main>
    <h1 class="sr-only">Stoa</h1>
    <HeroBanner />

    <div class="relative z-10 -mt-6 space-y-10 sm:space-y-12">
      <ContentRow
        v-if="continueWatching.length"
        title="Continue watching"
        subtitle="Pick up where you left off"
      >
        <EpisodeCard
          v-for="item in continueWatching"
          :key="item.episode.id"
          :episode="item.episode"
          :progress="item.fraction"
        />
      </ContentRow>

      <ContentRow title="Start here" subtitle="New to Stoa? One way into every show">
        <EpisodeCard
          v-for="item in startHere"
          :key="item.show.id"
          :episode="item.episode"
          :locked="!canWatch(item.episode)"
          variant="show"
        />
      </ContentRow>

      <ContentRow
        :title="isMember ? 'Latest' : 'Latest free episodes'"
        :subtitle="isMember ? undefined : 'Free shows and free previews from members\' series'"
      >
        <EpisodeCard
          v-for="episode in latest"
          :key="episode.id"
          :episode="episode"
          :progress="progressFor(episode.id)"
        />
      </ContentRow>

      <ContentRow title="Latest articles" subtitle="Free to read">
        <template #action>
          <RouterLink to="/articles" class="shrink-0 text-sm text-muted hover:text-white">
            See all
          </RouterLink>
        </template>
        <ArticleCard v-for="article in articles" :key="article.id" :article="article" />
      </ContentRow>

      <!-- What free gets, and what joining adds. Free viewers only. -->
      <aside
        v-if="!isMember"
        class="mx-4 flex flex-col gap-4 rounded-xl bg-gradient-to-r from-accent/40 to-surface p-6 ring-1 ring-white/10 sm:mx-8 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p class="text-lg font-semibold">Free gets you the daily shows. Members get everything.</p>
          <p class="mt-1 text-sm text-white/75">
            Full history series, geopolitics, economics and the live panel show, plus the
            back catalogue.
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
        v-for="show in premiumShows"
        :key="show.id"
        :title="show.name"
        :subtitle="show.tagline"
      >
        <template #action>
          <RouterLink
            v-if="!isMember"
            to="/join"
            class="shrink-0 text-sm font-semibold text-gold hover:underline"
          >
            Unlock {{ show.name }}
          </RouterLink>
          <RouterLink v-else to="/shows" class="shrink-0 text-sm text-muted hover:text-white">
            See all
          </RouterLink>
        </template>
        <EpisodeCard
          v-for="episode in episodesForShow(show.id)"
          :key="episode.id"
          :episode="episode"
          :locked="!canWatch(episode)"
          :progress="progressFor(episode.id)"
        />
      </ContentRow>

      <ContentRow title="Conversations" subtitle="Long-form interviews, free for everyone">
        <EpisodeCard
          v-for="episode in conversations"
          :key="episode.id"
          :episode="episode"
          :progress="progressFor(episode.id)"
        />
      </ContentRow>
    </div>
  </main>
</template>
