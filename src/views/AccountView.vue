<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import CardSkeleton from '@/components/CardSkeleton.vue'
import EpisodeCard from '@/components/EpisodeCard.vue'
import NewsletterSignup from '@/components/NewsletterSignup.vue'
import { getEpisodes } from '@/api/catalogue'
import { listShows } from '@/data/catalogue'
import { getCourse } from '@/data/courses'
import { tiers } from '@/data/membership'
import { useCommunity } from '@/composables/useCommunity'
import { usePurchases } from '@/composables/usePurchases'
import { useQuery } from '@/composables/useQuery'
import { useReminders } from '@/composables/useReminders'
import { useViewer } from '@/composables/useViewer'
import { useWatchProgress } from '@/composables/useWatchProgress'
import { formatPrice } from '@/utils/format'
import PitchNote from '@/pitch/PitchNote.vue'

// The account page, built from the demo's real state: it changes as you
// watch, set reminders or switch viewer in the demo panel. Billing, email
// and password need a real back end, so their buttons say so.

const { isSignedIn, isMember, user } = useViewer()
const { inProgressIds, progressFor, clear } = useWatchProgress()
const { reminders, turnOff } = useReminders()

const tier = computed(() => tiers.find((t) => t.id === user.value?.tier))
const { joined, leave } = useCommunity()
const { owned } = usePurchases()
const bought = useQuery(
  () => owned.value.join(','),
  () => getEpisodes(owned.value),
)
const communities = computed(() => joined.value.map((id) => getCourse(id)).filter((c) => c !== undefined))

const history = useQuery(
  () => inProgressIds.value.join(','),
  () => getEpisodes(inProgressIds.value),
)

const reminderShows = computed(() =>
  reminders.value.map((id) => ({ id, name: listShows().find((s) => s.id === id)?.name ?? id })),
)

const notInDemo = ref<string | null>(null)
const settings = [
  { id: 'email', label: 'Email address', value: 'chris.m@example.com', action: 'Change' },
  { id: 'password', label: 'Password', value: 'Last changed 3 months ago', action: 'Change' },
  { id: 'billing', label: 'Payment method', value: 'Card ending 0000', action: 'Update' },
]
</script>

<template>
  <main v-if="isSignedIn && user" class="mx-auto max-w-4xl px-4 pt-8 sm:px-8">
    <div class="flex items-center gap-4">
      <span class="grid size-14 place-items-center rounded-full bg-accent text-lg font-bold">{{ user.initials }}</span>
      <div>
        <h1 class="text-2xl font-bold sm:text-3xl">
          {{ user.name }} <PitchNote id="account-page" class="align-middle" />
        </h1>
        <p class="text-sm text-muted">{{ tier ? `${tier.name} member` : 'Free account' }}</p>
      </div>
    </div>

    <section class="mt-8 rounded-xl bg-surface p-5 ring-1 ring-white/10" aria-labelledby="membership">
      <h2 id="membership" class="text-lg font-semibold">Membership</h2>
      <template v-if="isMember && tier">
        <p class="mt-2 text-white/85">
          <span class="font-semibold text-gold">{{ tier.name }}</span
          >, {{ formatPrice(tier.monthly) }} a month. {{ tier.summary }}
        </p>
        <div class="mt-4 flex flex-wrap gap-3">
          <RouterLink
            to="/join"
            class="inline-flex min-h-9 items-center rounded-lg bg-white/10 px-4 text-sm font-semibold ring-1 ring-white/15 hover:bg-white/20"
          >
            Compare plans
          </RouterLink>
          <button
            type="button"
            class="inline-flex min-h-9 items-center rounded-lg px-4 text-sm text-white/70 hover:text-white"
            @click="notInDemo = 'cancel'"
          >
            Cancel membership
          </button>
        </div>
        <p v-if="notInDemo === 'cancel'" class="mt-2 text-sm text-white/75" role="status">
          Changing a membership is not part of this demo.
        </p>
      </template>
      <template v-else>
        <p class="mt-2 text-white/85">
          You have a free account: the daily shows, the live stream and chat, free previews and every article.
        </p>
        <RouterLink
          to="/join"
          class="mt-4 inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-ink hover:brightness-110 [&>svg]:size-4"
        >
          <AppIcon name="crown" />
          Upgrade: Bronze and Silver are free for 7 days
        </RouterLink>
      </template>
    </section>

    <section class="mt-10" aria-labelledby="watch-history">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 id="watch-history" class="text-lg font-semibold">Continue watching</h2>
        <button
          v-if="inProgressIds.length"
          type="button"
          class="inline-flex min-h-6 items-center text-sm text-muted underline hover:text-white"
          @click="clear()"
        >
          Clear history
        </button>
      </div>
      <p v-if="!inProgressIds.length" class="mt-2 text-sm text-muted">
        Nothing in progress. Episodes you start will appear here.
      </p>
      <div v-else class="mt-4 grid grid-cols-1 gap-x-4 gap-y-8 min-[480px]:grid-cols-2 lg:grid-cols-3">
        <CardSkeleton v-if="history.loading.value && !history.data.value" :count="3" fluid />
        <EpisodeCard
          v-for="episode in history.data.value ?? []"
          v-else
          :key="episode.id"
          :episode="episode"
          :progress="progressFor(episode.id)"
          :locked="episode.access === 'premium' && !isMember"
          fluid
        />
      </div>
    </section>

    <section v-if="owned.length" class="mt-10" aria-labelledby="your-episodes">
      <h2 id="your-episodes" class="text-lg font-semibold">Your episodes</h2>
      <p class="text-sm text-muted">Bought one at a time, yours to keep.</p>
      <div class="mt-4 grid grid-cols-1 gap-x-4 gap-y-8 min-[480px]:grid-cols-2 lg:grid-cols-3">
        <CardSkeleton v-if="bought.loading.value && !bought.data.value" :count="2" fluid />
        <EpisodeCard v-for="episode in bought.data.value ?? []" v-else :key="episode.id" :episode="episode" fluid />
      </div>
    </section>

    <section class="mt-10" aria-labelledby="live-reminders">
      <h2 id="live-reminders" class="text-lg font-semibold">Live reminders</h2>
      <p v-if="!isMember" class="mt-2 text-sm text-muted">Reminders when a show goes live are a members' perk.</p>
      <p v-else-if="!reminderShows.length" class="mt-2 text-sm text-muted">
        No reminders yet. Set one from the schedule on the
        <RouterLink to="/live" class="underline hover:text-white">Live page</RouterLink>.
      </p>
      <ul v-else class="mt-3 divide-y divide-white/5 rounded-xl bg-surface ring-1 ring-white/10">
        <li v-for="r in reminderShows" :key="r.id" class="flex items-center justify-between gap-3 px-4 py-3">
          <span class="flex items-center gap-2 text-sm font-medium [&>svg]:size-4"
            ><AppIcon name="bell" /> {{ r.name }}</span
          >
          <button
            type="button"
            class="inline-flex min-h-8 items-center rounded-lg px-3 text-sm text-white/75 ring-1 ring-white/15 hover:bg-white/10 hover:text-white"
            @click="turnOff(r.id)"
          >
            Turn off
          </button>
        </li>
      </ul>
    </section>

    <section class="mt-10" aria-labelledby="communities">
      <h2 id="communities" class="text-lg font-semibold">Communities</h2>
      <p v-if="!communities.length" class="mt-2 text-sm text-muted">
        You have not joined a community yet. The
        <RouterLink to="/courses/philosophy-circle" class="underline hover:text-white">Philosophy Circle</RouterLink> is
        free to join.
      </p>
      <ul v-else class="mt-3 divide-y divide-white/5 rounded-xl bg-surface ring-1 ring-white/10">
        <li v-for="c in communities" :key="c.id" class="flex items-center justify-between gap-3 px-4 py-3">
          <RouterLink :to="`/courses/${c.id}`" class="text-sm font-medium hover:underline">{{ c.title }}</RouterLink>
          <button
            type="button"
            class="inline-flex min-h-8 items-center rounded-lg px-3 text-sm text-white/75 ring-1 ring-white/15 hover:bg-white/10 hover:text-white"
            @click="leave(c.id)"
          >
            Leave
          </button>
        </li>
      </ul>
    </section>

    <section class="mt-10 max-w-md rounded-xl bg-surface p-5 ring-1 ring-white/10">
      <NewsletterSignup />
    </section>

    <section class="mt-10" aria-labelledby="account-settings">
      <h2 id="account-settings" class="text-lg font-semibold">Account settings</h2>
      <ul class="mt-3 divide-y divide-white/5 rounded-xl bg-surface ring-1 ring-white/10">
        <li
          v-for="item in settings"
          :key="item.id"
          class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 py-3"
        >
          <span>
            <span class="block text-sm font-medium">{{ item.label }}</span>
            <span class="block text-xs text-muted">{{ item.value }}</span>
            <span v-if="notInDemo === item.id" class="mt-1 block text-xs text-white/75" role="status"
              >Not part of this demo.</span
            >
          </span>
          <button
            type="button"
            class="inline-flex min-h-8 items-center rounded-lg px-3 text-sm text-white/75 ring-1 ring-white/15 hover:bg-white/10 hover:text-white"
            @click="notInDemo = item.id"
          >
            {{ item.action }}
          </button>
        </li>
      </ul>
    </section>
  </main>

  <main v-else class="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
    <h1 class="font-serif text-4xl font-bold">Your account</h1>
    <p class="mt-3 text-white/80">Sign in to see your membership, watch history and reminders.</p>
    <p class="mt-2 text-sm text-muted">
      This demo has no real accounts. Use the Demo button to view the site as a free account or a member.
    </p>
    <RouterLink to="/sign-in" class="mt-6 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-ink"
      >Sign in</RouterLink
    >
  </main>
</template>
