<script setup lang="ts">
import { computed } from 'vue'
import type { Vote } from '@/types/content'

// Likes and dislikes, shared by comments and live chat. Shows the stored
// counts plus the viewer's own vote, and announces a vote to the parent.
// One vote each: clicking it again removes it, the other side switches.

const props = withDefaults(
  defineProps<{
    likes: number
    dislikes: number
    vote?: Vote | null
    canVote: boolean
    /** Chat style: smaller, zero counts hidden, buttons shown on hover on desktop. */
    compact?: boolean
  }>(),
  { vote: null, compact: false },
)

const emit = defineEmits<{ vote: [direction: Vote] }>()

const up = computed(() => props.likes + (props.vote === 'up' ? 1 : 0))
const down = computed(() => props.dislikes + (props.vote === 'down' ? 1 : 0))
const hasActivity = computed(() => up.value + down.value > 0)

const wrapper = computed(() => {
  if (!props.compact) return 'gap-4 text-xs'
  // In chat, quiet messages only show their buttons on hover or focus.
  const reveal = hasActivity.value
    ? ''
    : 'md:opacity-0 md:group-hover/msg:opacity-100 md:group-focus-within/msg:opacity-100'
  return `gap-2 text-[11px] align-middle ${reveal}`
})
</script>

<template>
  <span
    v-if="canVote || !compact || hasActivity"
    class="inline-flex items-center text-muted transition-opacity"
    :class="wrapper"
  >
    <template v-if="canVote">
      <button
        type="button"
        class="flex items-center gap-1 transition hover:text-white"
        :class="vote === 'up' ? 'text-accent-bright' : ''"
        :aria-pressed="vote === 'up'"
        :aria-label="`Like, ${up} ${up === 1 ? 'like' : 'likes'}`"
        @click="emit('vote', 'up')"
      >
        <span aria-hidden="true">▲</span>
        <span v-if="!compact || up">{{ up }}</span>
      </button>
      <button
        type="button"
        class="flex items-center gap-1 transition hover:text-white"
        :class="vote === 'down' ? 'text-accent-bright' : ''"
        :aria-pressed="vote === 'down'"
        :aria-label="`Dislike, ${down} ${down === 1 ? 'dislike' : 'dislikes'}`"
        @click="emit('vote', 'down')"
      >
        <span aria-hidden="true">▼</span>
        <span v-if="!compact || down">{{ down }}</span>
      </button>
    </template>

    <template v-else>
      <span v-if="!compact || up" :aria-label="`${up} likes`"><span aria-hidden="true">▲ {{ up }}</span></span>
      <span v-if="!compact || down" :aria-label="`${down} dislikes`"><span aria-hidden="true">▼ {{ down }}</span></span>
    </template>
  </span>
</template>
