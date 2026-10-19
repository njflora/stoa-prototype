<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from './AppIcon.vue'
import CommentItem from './CommentItem.vue'
import { countComments, type Comment } from '@/data/comments'
import { commentsForThread } from '@/data/episodeExtras'
import { useViewer } from '@/composables/useViewer'
import { controversy, useVotes } from '@/composables/useVotes'

// Comments on one episode. Everyone can read and see the votes.
// Commenting is a members' perk, so members can post, vote and reply;
// free accounts see an upgrade prompt and signed-out visitors a sign-in
// prompt. Posts and votes are kept in the page only: no server.

type Sort = 'newest' | 'top' | 'controversial'

const sortOptions: { id: Sort; label: string }[] = [
  { id: 'newest', label: 'Newest' },
  { id: 'top', label: 'Top' },
  { id: 'controversial', label: 'Controversial' },
]

const props = defineProps<{
  /** Which thread to show: an episode id, or a hand-written thread such as "stoa-podcast-1432". */
  threadId: string
}>()

const PAGE_SIZE = 5

const { isMember, isSignedIn, user } = useViewer()
const headingId = useId()

// A copy, so posting here never changes the placeholder data.
const comments = ref<Comment[]>(structuredClone(commentsForThread(props.threadId)))
const sort = ref<Sort>('newest')
const shown = ref(PAGE_SIZE)
const { vote, voteFor, totals } = useVotes()
const draft = ref('')
const replyingTo = ref<string | null>(null)
const replyDraft = ref('')
let localId = 0

const total = computed(() => countComments(comments.value))

function score(c: Comment): number {
  const { likes, dislikes } = totals(c.id, c.likes, c.dislikes)
  if (sort.value === 'top') return likes - dislikes
  return controversy(likes, dislikes)
}

const sorted = computed(() =>
  [...comments.value].sort((a, b) =>
    sort.value === 'newest' ? b.postedAt.localeCompare(a.postedAt) : score(b) - score(a),
  ),
)
const visible = computed(() => sorted.value.slice(0, shown.value))

function newComment(text: string): Comment {
  return {
    id: `local-${++localId}`,
    user: user.value?.name ?? 'You',
    tier: user.value?.tier ?? 'free',
    postedAt: new Date().toISOString(),
    text: text.trim(),
    likes: 0,
    dislikes: 0,
    replies: [],
    mine: true,
  }
}

function post() {
  if (!draft.value.trim()) return
  comments.value.unshift(newComment(draft.value))
  draft.value = ''
  sort.value = 'newest'
}

function startReply(id: string) {
  replyingTo.value = replyingTo.value === id ? null : id
  replyDraft.value = ''
}

function postReply(parent: Comment) {
  if (!replyDraft.value.trim()) return
  parent.replies.push(newComment(replyDraft.value))
  replyingTo.value = null
  replyDraft.value = ''
}
</script>

<template>
  <section :aria-labelledby="headingId">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <h2 :id="headingId" class="text-lg font-semibold sm:text-xl">
        Comments <span class="text-muted">({{ total }})</span>
      </h2>
      <div class="inline-flex rounded-lg bg-surface p-1 ring-1 ring-white/10" role="group" aria-label="Sort comments">
        <button
          v-for="option in sortOptions"
          :key="option.id"
          type="button"
          class="rounded-md px-3 py-1 text-xs font-medium transition"
          :class="sort === option.id ? 'bg-accent text-white' : 'text-white/70 hover:text-white'"
          :aria-pressed="sort === option.id"
          @click="sort = option.id"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <!-- Members: write a comment. -->
    <form v-if="isMember" class="mt-4 flex gap-3" @submit.prevent="post">
      <span class="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold" aria-hidden="true">
        {{ user?.initials }}
      </span>
      <div class="min-w-0 flex-1">
        <label for="new-comment" class="sr-only">Add a comment</label>
        <textarea
          id="new-comment"
          v-model="draft"
          rows="2"
          placeholder="Add a comment"
          class="block w-full resize-y rounded-lg bg-surface px-3 py-2 text-sm ring-1 ring-white/10 placeholder:text-muted focus:ring-2 focus:ring-accent-bright focus:outline-none"
        />
        <div class="mt-2 flex justify-end">
          <button
            type="submit"
            class="rounded-lg bg-white px-4 py-1.5 text-sm font-semibold text-ink transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="!draft.trim()"
          >
            Post
          </button>
        </div>
      </div>
    </form>

    <!-- Free account: commenting is a members' perk. -->
    <div
      v-else-if="isSignedIn"
      class="mt-4 flex flex-col gap-3 rounded-lg bg-surface p-4 ring-1 ring-white/10 sm:flex-row sm:items-center sm:justify-between"
    >
      <p class="flex items-center gap-2 text-sm text-white/85">
        <AppIcon name="lock" class="!size-4 text-gold" />
        Commenting is for members.
      </p>
      <RouterLink
        to="/join"
        class="inline-flex items-center gap-1.5 self-start rounded-lg bg-gold px-4 py-1.5 text-sm font-semibold whitespace-nowrap text-ink hover:brightness-110 sm:self-auto [&>svg]:size-4"
      >
        <AppIcon name="crown" />
        Upgrade to comment
      </RouterLink>
    </div>

    <!-- Signed out. -->
    <div
      v-else
      class="mt-4 flex flex-col gap-3 rounded-lg bg-surface p-4 ring-1 ring-white/10 sm:flex-row sm:items-center sm:justify-between"
    >
      <p class="text-sm text-white/85">Sign in to join the discussion.</p>
      <RouterLink
        to="/sign-in"
        class="self-start rounded-lg px-4 py-1.5 text-sm font-semibold whitespace-nowrap ring-1 ring-white/25 hover:bg-white/10 sm:self-auto"
      >
        Sign in / Sign up
      </RouterLink>
    </div>

    <ol class="mt-6 space-y-6">
      <li v-for="c in visible" :key="c.id">
        <CommentItem
          :comment="c"
          :vote="voteFor(c.id)"
          :can-interact="isMember"
          @vote="vote"
          @reply="startReply"
        />

        <form v-if="replyingTo === c.id" class="mt-3 ml-12" @submit.prevent="postReply(c)">
          <label :for="`reply-${c.id}`" class="sr-only">Reply to {{ c.user }}</label>
          <textarea
            :id="`reply-${c.id}`"
            v-model="replyDraft"
            rows="2"
            :placeholder="`Reply to ${c.user}`"
            class="block w-full resize-y rounded-lg bg-surface px-3 py-2 text-sm ring-1 ring-white/10 placeholder:text-muted focus:ring-2 focus:ring-accent-bright focus:outline-none"
          />
          <div class="mt-2 flex justify-end gap-2">
            <button type="button" class="px-3 py-1.5 text-sm text-muted hover:text-white" @click="replyingTo = null">
              Cancel
            </button>
            <button
              type="submit"
              class="rounded-lg bg-white px-4 py-1.5 text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="!replyDraft.trim()"
            >
              Reply
            </button>
          </div>
        </form>

        <ol v-if="c.replies.length" class="mt-4 ml-12 space-y-4 border-l border-white/10 pl-4">
          <li v-for="r in c.replies" :key="r.id">
            <CommentItem
              :comment="r"
              :vote="voteFor(r.id)"
              :can-interact="isMember"
              is-reply
              @vote="vote"
            />
          </li>
        </ol>
      </li>
    </ol>

    <button
      v-if="shown < sorted.length"
      type="button"
      class="mt-6 w-full rounded-lg bg-surface py-2.5 text-sm font-medium ring-1 ring-white/10 hover:bg-raised"
      @click="shown += PAGE_SIZE"
    >
      Show more comments
    </button>
  </section>
</template>
