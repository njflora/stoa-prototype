<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from './AppIcon.vue'
import { chatMessages, showLengthSeconds, tierStyles, type ChatMessage } from '@/data/chat'
import { formatClock } from '@/utils/format'

// The live chat, and its replay alongside the recording.
//   live:   messages arrive every few seconds (mocked here).
//   replay: a timeline shows the messages sent up to that point in the
//           show. On a real site the timeline follows the video player.
//   closed: before the show.
//   locked: the members' after-show, seen by a free viewer.

const props = defineProps<{
  mode: 'live' | 'replay' | 'closed' | 'locked'
  /** Shown in the empty state before the show, such as "13:00". */
  opensAt?: string
  /** Signed-in viewers see a message box instead of "Sign in to chat". */
  signedIn?: boolean
}>()

const LIVE_START_SECONDS = 1800
const LIVE_INTERVAL_MS = 2800
const MAX_LIVE_MESSAGES = 150

const list = ref<HTMLElement>()

// Live mode: start part-way into the show, then add one message at a time.
// The first pass stops before the closing sign-off. After that the mock
// feed loops, skipping the opening welcome and the sign-off so it still
// reads like the middle of a show.
const firstPass = chatMessages.slice(0, -1)
const loop = chatMessages.slice(1, -1)
const liveMessages = ref<ChatMessage[]>(chatMessages.filter((m) => m.at <= LIVE_START_SECONDS))
let nextIndex = liveMessages.value.length
let sent = 0
let liveTimer: ReturnType<typeof setInterval> | undefined

function addLiveMessage() {
  const source =
    nextIndex < firstPass.length
      ? firstPass[nextIndex]!
      : loop[(nextIndex - firstPass.length) % loop.length]!
  nextIndex++
  sent++
  liveMessages.value = [
    ...liveMessages.value.slice(-MAX_LIVE_MESSAGES + 1),
    { ...source, id: `${source.id}-${sent}` },
  ]
}

// Replay mode: a position in the recording, in seconds.
const position = ref(LIVE_START_SECONDS)
const playing = ref(false)
const fast = ref(false)
let replayTimer: ReturnType<typeof setInterval> | undefined

const replayMessages = computed(() => chatMessages.filter((m) => m.at <= position.value))
const messages = computed(() => (props.mode === 'replay' ? replayMessages.value : liveMessages.value))

function togglePlay() {
  playing.value = !playing.value
}

// Keep the newest message in view, unless the viewer has scrolled up to read.
const pinnedToBottom = ref(true)
function onScroll() {
  const el = list.value
  if (!el) return
  pinnedToBottom.value = el.scrollHeight - el.scrollTop - el.clientHeight < 40
}
watch(
  () => messages.value.length,
  async () => {
    if (!pinnedToBottom.value) return
    await nextTick()
    list.value?.scrollTo({ top: list.value.scrollHeight })
  },
)

onMounted(() => {
  list.value?.scrollTo({ top: list.value.scrollHeight })
  liveTimer = setInterval(() => {
    if (props.mode === 'live') addLiveMessage()
  }, LIVE_INTERVAL_MS)
  replayTimer = setInterval(() => {
    if (props.mode !== 'replay' || !playing.value) return
    position.value = Math.min(showLengthSeconds, position.value + (fast.value ? 10 : 1))
    if (position.value >= showLengthSeconds) playing.value = false
  }, 1000)
})
onUnmounted(() => {
  clearInterval(liveTimer)
  clearInterval(replayTimer)
})
</script>

<template>
  <section class="flex min-h-0 flex-col bg-surface lg:rounded-xl lg:ring-1 lg:ring-white/10" aria-label="Chat">
    <header class="flex items-center justify-between border-b border-white/5 px-4 py-2.5">
      <h2 class="text-sm font-semibold">
        {{ mode === 'replay' ? 'Chat replay' : mode === 'locked' ? "Members' chat" : 'Live chat' }}
      </h2>
      <span v-if="mode === 'replay'" class="text-xs text-muted">Synced to the recording</span>
    </header>

    <div v-if="$slots.pinned && mode === 'live'" class="border-b border-white/5 p-3">
      <slot name="pinned" />
    </div>

    <!-- Before the show -->
    <div v-if="mode === 'closed'" class="grid flex-1 place-items-center p-6 text-center text-sm text-muted">
      <p>Chat opens when the show starts{{ opensAt ? ` at ${opensAt}` : '' }}.</p>
    </div>

    <!-- Free viewer during the members' after-show -->
    <div v-else-if="mode === 'locked'" class="grid flex-1 place-items-center p-6 text-center">
      <div>
        <span class="mx-auto grid size-10 place-items-center rounded-full bg-black/55 ring-1 ring-white/20">
          <AppIcon name="lock" />
        </span>
        <p class="mt-3 text-sm font-semibold">The after-show chat is for members</p>
        <RouterLink
          to="/join"
          class="mt-3 inline-block rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-ink hover:brightness-110"
        >
          Continue as a member
        </RouterLink>
      </div>
    </div>

    <template v-else>
      <ol
        ref="list"
        class="min-h-0 flex-1 overflow-y-auto px-4 py-2"
        :role="mode === 'live' ? 'log' : undefined"
        :aria-live="mode === 'live' ? 'polite' : undefined"
        @scroll.passive="onScroll"
      >
        <li
          v-for="m in messages"
          :key="m.id"
          :class="m.question ? 'my-2 rounded-lg bg-gold/10 p-2.5 ring-1 ring-gold/40' : 'py-1'"
        >
          <p v-if="m.question" class="mb-1 text-[10px] font-bold tracking-widest text-gold uppercase">
            Gold question
          </p>
          <p class="text-sm leading-snug">
            <span v-if="mode === 'replay'" class="mr-1.5 text-[11px] text-muted tabular-nums">
              {{ formatClock(m.at) }}
            </span>
            <span
              v-if="tierStyles[m.tier].label"
              class="mr-1 rounded px-1 py-px align-[1px] text-[9px] font-bold tracking-wide uppercase"
              :class="tierStyles[m.tier].class"
            >
              {{ tierStyles[m.tier].label }}
            </span>
            <span class="font-semibold" :class="m.tier === 'staff' ? 'text-accent-bright' : 'text-white/90'"
              >{{ m.user }}:</span
            >{{ ' ' }}<span class="text-white/80">{{ m.text }}</span>
          </p>
        </li>
      </ol>

      <footer class="border-t border-white/5 p-3">
        <div v-if="mode === 'replay'" class="flex items-center gap-3">
          <button
            type="button"
            class="grid size-8 shrink-0 place-items-center rounded-full bg-white text-ink"
            :aria-label="playing ? 'Pause replay' : 'Play replay'"
            @click="togglePlay"
          >
            <AppIcon v-if="!playing" name="play" />
            <span v-else class="flex gap-1" aria-hidden="true">
              <span class="h-3 w-1 bg-ink" /><span class="h-3 w-1 bg-ink" />
            </span>
          </button>
          <input
            v-model.number="position"
            type="range"
            min="0"
            :max="showLengthSeconds"
            step="1"
            class="min-w-0 flex-1 accent-accent-bright"
            aria-label="Position in the recording"
            :aria-valuetext="formatClock(position)"
          />
          <span class="w-14 shrink-0 text-right text-xs text-muted tabular-nums">{{ formatClock(position) }}</span>
          <button
            type="button"
            class="shrink-0 rounded px-1.5 py-0.5 text-xs ring-1"
            :class="fast ? 'bg-white text-ink ring-white' : 'text-white/70 ring-white/20'"
            :aria-pressed="fast"
            @click="fast = !fast"
          >
            10×
          </button>
        </div>
        <!-- A mock-up: the prototype has no chat server, so nothing is sent. -->
        <form v-else-if="signedIn" class="flex gap-2" @submit.prevent>
          <label for="chat-message" class="sr-only">Message</label>
          <input
            id="chat-message"
            type="text"
            disabled
            placeholder="Chat is a mock-up in this prototype"
            class="min-w-0 flex-1 rounded-lg bg-raised px-3 py-2 text-sm placeholder:text-muted disabled:cursor-not-allowed"
          />
        </form>
        <RouterLink
          v-else
          to="/sign-in"
          class="block rounded-lg bg-raised px-3 py-2 text-center text-sm text-white/80 hover:bg-line"
        >
          Sign in to chat
        </RouterLink>
      </footer>
    </template>
  </section>
</template>
