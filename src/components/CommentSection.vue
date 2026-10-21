<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { RouterLink } from 'vue-router'
import PitchNote from './PitchNote.vue'
import CommentItem from './CommentItem.vue'
import MembersGate from './MembersGate.vue'
import { API_MODE } from '@/api/client'
import { getThread, postComment, voteOnComment, type ThreadRef } from '@/api/discussion'
import { countComments, type Comment } from '@/data/comments'
import type { Vote } from '@/types/content'
import { useQuery } from '@/composables/useQuery'
import { useViewer } from '@/composables/useViewer'
import { controversy, useVotes } from '@/composables/useVotes'

// Comments on an episode, an article or the live show. Open threads are for
// every account, the rest for members (backend/config/stoa.php). A
// non-member sees a members' thread as a blurred gate with nothing real
// behind it. In Laravel mode the server decides, and sends a non-member the
// count only; posts and votes are saved on the account. The static preview
// applies the same rule in the page, and saves posts and votes in this
// browser.

type Sort = 'newest' | 'top' | 'controversial'

const sortOptions: { id: Sort; label: string }[] = [
  { id: 'newest', label: 'Newest' },
  { id: 'top', label: 'Top' },
  { id: 'controversial', label: 'Controversial' },
]

const props = defineProps<{
  /** Which discussion: an episode's, an article's or the live show's. */
  thread: ThreadRef
}>()

const PAGE_SIZE = 5

const { viewer, isMember, isSignedIn, user } = useViewer()
const headingId = useId()

// Asked again when the viewer changes: the answer depends on who is asking.
const { data, loading, error, reload } = useQuery(
  () => `${JSON.stringify(props.thread)}|${viewer.value}`,
  () => getThread(props.thread),
)

const open = computed(() => data.value?.open ?? false)
/** A members' thread seen by a non-member: the gate. The server says, or in the static preview the same rule here. */
const locked = computed(() => {
  const thread = data.value
  if (!thread) return false
  return API_MODE === 'laravel' ? thread.locked : !thread.open && !isMember.value
})
/** Post, reply and vote. */
const canPost = computed(() => {
  const thread = data.value
  if (!thread || thread.locked || locked.value) return false
  return API_MODE === 'laravel' ? Boolean(thread.canPost) : isMember.value || (thread.open && isSignedIn.value)
})

// A copy, so posting here never changes the loaded data.
const comments = ref<Comment[]>([])
const sort = ref<Sort>('newest')
const shown = ref(PAGE_SIZE)
const { votes, vote: toggleVote, voteFor, totals } = useVotes()
const draft = ref('')
const replyingTo = ref<string | null>(null)
const replyDraft = ref('')
const postError = ref('')

watch(data, (thread) => {
  comments.value = thread && !thread.locked ? structuredClone(thread.comments) : []
  // The viewer's saved votes (Laravel mode); the counts already leave them out.
  votes.value = Object.fromEntries(
    comments.value.flatMap((c) => [c, ...c.replies]).flatMap((c) => (c.myVote ? [[c.id, c.myVote]] : [])),
  )
})

const total = computed(() => (data.value?.locked ? data.value.count : countComments(comments.value)))

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

/** A new comment: saved on the account in Laravel mode, in this browser in the static preview. */
async function save(text: string, parent?: Comment): Promise<Comment | null> {
  postError.value = ''
  const author = { name: user.value?.name ?? 'You', tier: user.value?.tier ?? ('free' as const) }
  try {
    return await postComment(props.thread, text.trim(), author, parent?.id)
  } catch {
    postError.value = 'Your comment was not posted. Please try again.'
    return null
  }
}

async function post() {
  if (!draft.value.trim()) return
  const saved = await save(draft.value)
  if (!saved) return
  comments.value.unshift(saved)
  draft.value = ''
  sort.value = 'newest'
}

function startReply(id: string) {
  replyingTo.value = replyingTo.value === id ? null : id
  replyDraft.value = ''
}

async function postReply(parent: Comment) {
  if (!replyDraft.value.trim()) return
  const saved = await save(replyDraft.value, parent)
  if (!saved) return
  parent.replies.push(saved)
  replyingTo.value = null
  replyDraft.value = ''
}

/** Shows the vote at once, then saves it, and takes it back if saving fails. */
async function vote(id: string, direction: Vote) {
  const before = voteFor(id)
  toggleVote(id, direction)
  try {
    await voteOnComment(id, voteFor(id))
  } catch {
    const next = { ...votes.value }
    if (before) next[id] = before
    else delete next[id]
    votes.value = next
  }
}
</script>

<template>
  <section :aria-labelledby="headingId">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <h2 :id="headingId" class="text-lg font-semibold sm:text-xl">
        Comments <span v-if="data" class="text-muted">({{ total }})</span>
      </h2>
      <PitchNote v-if="thread.type === 'article'" id="article-comments" class="ml-auto" />
      <PitchNote id="votes" :class="thread.type === 'article' ? '' : 'ml-auto'" />
      <p v-if="data" class="w-full text-xs text-muted sm:order-last">
        {{ open ? 'Open to all accounts' : 'Members only' }}
        <PitchNote id="open-spaces" class="ml-1 align-middle" />
      </p>
      <div v-if="!locked" class="inline-flex rounded-lg bg-surface p-1 ring-1 ring-white/10" role="group" aria-label="Sort comments">
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

    <p v-if="loading && !data" class="mt-4 text-sm text-muted">Loading comments…</p>
    <div v-else-if="error && !data" class="mt-4 flex items-center gap-3 text-sm text-muted">
      Comments could not load.
      <button type="button" class="font-semibold text-white underline underline-offset-2" @click="reload">Try again</button>
    </div>

    <!-- Anyone allowed to post here: write a comment. -->
    <form v-else-if="canPost" class="mt-4 flex gap-3" @submit.prevent="post">
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

    <!-- Members' discussion, seen by a non-member. -->
    <MembersGate
      v-else-if="locked"
      class="mt-4"
      kind="comments"
      title="The members' discussion"
      :detail="`${total} ${total === 1 ? 'comment' : 'comments'} from members. Join to read them and have your say.`"
    />


    <!-- Signed out, in an open space. -->
    <div
      v-else-if="data"
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

    <p v-if="postError" class="mt-3 text-sm text-[#ff8a80]" role="alert">{{ postError }}</p>

    <ol v-if="!locked" class="mt-6 space-y-6">
      <li v-for="c in visible" :key="c.id">
        <CommentItem
          :comment="c"
          :vote="voteFor(c.id)"
          :can-interact="canPost"
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
              :can-interact="canPost"
              is-reply
              @vote="vote"
            />
          </li>
        </ol>
      </li>
    </ol>

    <button
      v-if="!locked && shown < sorted.length"
      type="button"
      class="mt-6 w-full rounded-lg bg-surface py-2.5 text-sm font-medium ring-1 ring-white/10 hover:bg-raised"
      @click="shown += PAGE_SIZE"
    >
      Show more comments
    </button>
  </section>
</template>
