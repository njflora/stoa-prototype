<script setup lang="ts">
import { computed } from 'vue'
import { tierStyles } from '@/data/chat'
import type { Comment } from '@/data/comments'
import { formatTimeAgo } from '@/utils/format'

// One comment. It shows the data it is given and announces likes and
// replies to its parent, which owns the thread.

const props = defineProps<{
  comment: Comment
  liked: boolean
  /** Members can like and reply; everyone else can read. */
  canInteract: boolean
  /** Replies are not replied to again, so threads stay one level deep. */
  isReply?: boolean
}>()

const emit = defineEmits<{
  like: [id: string]
  reply: [id: string]
}>()

const initials = computed(() =>
  props.comment.user
    .replace(/[^A-Za-z]/g, ' ')
    .trim()
    .split(/\s+|(?=[A-Z])/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join(''),
)
const likes = computed(() => props.comment.likes + (props.liked ? 1 : 0))
</script>

<template>
  <article class="flex gap-3">
    <span
      class="grid shrink-0 place-items-center rounded-full font-bold"
      :class="[
        isReply ? 'size-7 text-[10px]' : 'size-9 text-xs',
        comment.mine ? 'bg-accent' : comment.tier === 'staff' ? 'bg-accent/60' : 'bg-raised',
      ]"
      aria-hidden="true"
    >
      {{ initials }}
    </span>

    <div class="min-w-0 flex-1">
      <p class="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
        <span class="font-semibold" :class="comment.tier === 'staff' ? 'text-accent-bright' : ''">
          {{ comment.mine ? 'You' : comment.user }}
        </span>
        <span
          v-if="tierStyles[comment.tier].label"
          class="rounded px-1 py-px text-[9px] font-bold tracking-wide uppercase"
          :class="tierStyles[comment.tier].class"
        >
          {{ tierStyles[comment.tier].label }}
        </span>
        <time :datetime="comment.postedAt" class="text-xs text-muted">
          {{ formatTimeAgo(comment.postedAt) }}
        </time>
      </p>

      <p class="mt-1 text-sm leading-relaxed text-white/85">{{ comment.text }}</p>

      <div class="mt-1.5 flex items-center gap-4 text-xs text-muted">
        <button
          v-if="canInteract"
          type="button"
          class="flex items-center gap-1 transition hover:text-white"
          :class="liked ? 'text-accent-bright' : ''"
          :aria-pressed="liked"
          :aria-label="`Like this comment, ${likes} likes`"
          @click="emit('like', comment.id)"
        >
          <span aria-hidden="true">▲</span> {{ likes }}
        </button>
        <span v-else :aria-label="`${likes} likes`"><span aria-hidden="true">▲</span> {{ likes }}</span>

        <button
          v-if="canInteract && !isReply"
          type="button"
          class="font-medium transition hover:text-white"
          @click="emit('reply', comment.id)"
        >
          Reply
        </button>
      </div>
    </div>
  </article>
</template>
