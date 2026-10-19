<script setup lang="ts">
import { computed, ref, watch, watchEffect } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import LiveChat from '@/components/LiveChat.vue'
import LiveCountdown from '@/components/LiveCountdown.vue'
import LivePlayer from '@/components/LivePlayer.vue'
import MemberHandoff from '@/components/MemberHandoff.vue'
import TitleCard from '@/components/TitleCard.vue'
import { getShow, hostNames } from '@/data/catalogue'
import { useLiveStatus } from '@/composables/useLiveStatus'
import { useViewer } from '@/composables/useViewer'
import type { Show } from '@/types/content'
import { downloadCalendarEvent } from '@/utils/calendar'
import { formatCountdown, formatLongDate, formatTime } from '@/utils/format'

// One page for the whole live show: countdown, the free stream, the break
// with its route into the members' after-show, and the recording with its
// chat replay. Phones get the video on top and chat below it.

const BREAK_MS = (28 * 60 + 14) * 1000

const { phase, event, nextStart, countdown, now } = useLiveStatus()
const { isMember, setPhase } = useViewer()
const show = getShow(event.showId)
const hosts = hostNames(event.hostIds)

// The break counts down to the members' after-show, then starts it.
const breakEndsAt = ref(Date.now() + BREAK_MS)
watch(phase, (p) => {
  if (p === 'break') breakEndsAt.value = Date.now() + BREAK_MS
})
const breakCountdown = computed(() => formatCountdown(breakEndsAt.value - now.value.getTime()))
watchEffect(() => {
  if (phase.value === 'break' && now.value.getTime() >= breakEndsAt.value) setPhase('members')
})

const title = computed(() =>
  phase.value === 'members' ? `${event.title}: Members' after-show` : event.title,
)

const status = computed(() => {
  switch (phase.value) {
    case 'upcoming':
      return `Starts ${startsLabel(nextStart.value)}`
    case 'live':
      return 'Live now. Free for everyone.'
    case 'break':
      return "The free stream has ended. The members' after-show is next."
    case 'members':
      return "Members' after-show, live now"
    default:
      return 'Recorded earlier today. Chat replay alongside.'
  }
})

const chatMode = computed(() => {
  if (phase.value === 'upcoming') return 'closed'
  if (phase.value === 'ended') return 'replay'
  if (phase.value === 'members' && !isMember.value) return 'locked'
  return 'live'
})

function startsLabel(date: Date): string {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const time = formatTime(date)
  if (date.toDateString() === today.toDateString()) return `today at ${time}`
  if (date.toDateString() === tomorrow.toDateString()) return `tomorrow at ${time}`
  return `${formatLongDate(date)} at ${time}`
}

/** The next given weekday (0 is Sunday) at the given hour. */
function nextWeekday(day: number, hour: number): Date {
  const date = new Date()
  date.setHours(hour, 0, 0, 0)
  const ahead = (day - date.getDay() + 7) % 7 || (date <= new Date() ? 7 : 0)
  date.setDate(date.getDate() + ahead)
  return date
}

const schedule = computed<{ show: Show; title: string; start: Date; members: boolean }[]>(() => [
  { show, title: 'The Stoa Podcast', start: nextStart.value, members: false },
  { show: getShow('the-forum'), title: 'The Forum, live', start: nextWeekday(4, 19), members: true },
  { show: getShow('statecraft'), title: 'Statecraft, live', start: nextWeekday(5, 15), members: true },
])

function addToCalendar(item: { title: string; start: Date }) {
  downloadCalendarEvent({
    title: item.title,
    start: item.start,
    durationMin: 90,
    description: 'Watch live on Stoa.',
    url: `${window.location.origin}/live`,
  })
}
</script>

<template>
  <main>
    <h1 class="sr-only">Live: {{ title }}</h1>

    <!-- Phones: one screen tall, video on top and chat filling the rest.
         Large screens: video and details on the left, chat on the right. -->
    <div
      class="flex h-[calc(100svh-var(--header-h,6rem))] flex-col lg:grid lg:h-auto lg:grid-cols-[minmax(0,1fr)_360px] lg:grid-rows-[auto_1fr] lg:gap-x-6 lg:px-8 lg:pt-6"
    >
      <div class="flex-none lg:col-start-1 lg:row-start-1">
        <LiveCountdown
          v-if="phase === 'upcoming'"
          :show="show"
          kicker="Starts in"
          :countdown="countdown"
          :note="`The Stoa Podcast, ${startsLabel(nextStart)}`"
        >
          <button
            type="button"
            class="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-ink hover:brightness-95"
            @click="addToCalendar(schedule[0]!)"
          >
            Add to calendar
          </button>
        </LiveCountdown>

        <LiveCountdown
          v-else-if="phase === 'break'"
          :show="show"
          kicker="Members' after-show starts in"
          :countdown="breakCountdown"
          note="The free stream has ended."
        >
          <RouterLink
            v-if="!isMember"
            to="/join"
            class="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-ink hover:brightness-110"
          >
            <AppIcon name="lock" />
            Continue as a member
          </RouterLink>
          <span v-else class="rounded-full border border-gold/50 px-3 py-1 text-xs font-semibold text-gold">
            You're in
          </span>
        </LiveCountdown>

        <!-- Free viewer during the members' after-show. -->
        <div
          v-else-if="phase === 'members' && !isMember"
          class="relative aspect-video w-full overflow-hidden bg-black lg:rounded-xl"
        >
          <TitleCard :show="show" :show-text="false" :animated="false" size="hero" class="scale-110 blur-xl brightness-75" />
          <div class="absolute inset-0 grid place-items-center px-4 text-center">
            <div>
              <span class="mx-auto grid size-12 place-items-center rounded-full bg-black/55 ring-1 ring-white/20">
                <AppIcon name="lock" />
              </span>
              <p class="mt-3 text-lg font-semibold sm:text-2xl">The members' after-show is live</p>
              <p class="mt-1 text-sm text-white/75">The hosts carry on, with Gold questions answered live.</p>
              <RouterLink
                to="/join"
                class="mt-4 inline-block rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-ink hover:brightness-110"
              >
                Continue as a member
              </RouterLink>
            </div>
          </div>
        </div>

        <LivePlayer
          v-else
          :show="show"
          :title="title"
          :mode="phase === 'ended' ? 'recording' : 'live'"
          :viewers="phase === 'members' ? 642 : event.viewers"
        />
      </div>

      <div class="flex-none px-4 pb-3 lg:col-start-1 lg:row-start-2 lg:px-0 lg:pt-3">
        <p class="truncate text-base font-semibold lg:text-2xl lg:whitespace-normal" aria-hidden="true">
          {{ title }}
        </p>
        <p class="truncate text-xs text-muted lg:mt-1 lg:text-sm">{{ hosts }} · {{ status }}</p>
      </div>

      <LiveChat
        :mode="chatMode"
        :opens-at="formatTime(nextStart)"
        :signed-in="isMember"
        class="min-h-0 flex-1 border-t border-white/5 lg:sticky lg:top-[calc(var(--header-h,4rem)+1.5rem)] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:h-[calc(100svh-var(--header-h,4rem)-3rem)] lg:self-start lg:border-0"
      >
        <template v-if="phase === 'break'" #pinned>
          <MemberHandoff :is-member="isMember" :countdown="breakCountdown" />
        </template>
      </LiveChat>
    </div>

    <section class="px-4 pt-10 lg:px-8" aria-labelledby="schedule-heading">
      <h2 id="schedule-heading" class="text-lg font-semibold sm:text-xl">Coming up live</h2>
      <ul class="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <li
          v-for="item in schedule"
          :key="item.title"
          class="flex items-center gap-3 rounded-lg bg-surface p-3 ring-1 ring-white/10"
        >
          <div class="relative aspect-video w-24 shrink-0 overflow-hidden rounded">
            <TitleCard :show="item.show" :show-text="false" :animated="false" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold">{{ item.title }}</p>
            <p class="truncate text-xs text-muted">
              {{ startsLabel(item.start) }}{{ item.members ? ' · Members' : ' · Free' }}
            </p>
          </div>
          <button
            type="button"
            class="shrink-0 rounded-lg bg-raised px-3 py-1.5 text-xs font-medium hover:bg-line"
            :aria-label="`Add ${item.title} to calendar`"
            @click="addToCalendar(item)"
          >
            Add to calendar
          </button>
        </li>
      </ul>
    </section>
  </main>
</template>
