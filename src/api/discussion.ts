// Comments and reading lists. In Laravel mode each answer depends on who is
// signed in: someone who may not see a members' thread gets only its count.
// The static preview was exported as a signed-out visitor sees things, so it
// holds counts only for members' threads, whoever is "viewing".

import { API_MODE, getFresh, getJson, send } from './client'
import { shiftDate, storedPageOf } from './catalogue'
import type { Comment } from '@/data/comments'
import type { ReadingItem } from '@/data/readingLists'
import type { Vote } from '@/types/content'

/** Which discussion: an episode's, an article's or the live show's. */
export type ThreadRef = { type: 'episode'; id: string } | { type: 'article'; id: string } | { type: 'live' }

/** A thread as the viewer may see it. Locked: a count and nothing else. */
export type Thread =
  | { locked: true; open: boolean; count: number }
  | { locked: false; open: boolean; count: number; canPost?: boolean; comments: Comment[] }

export type ReadingListAnswer =
  | { locked: true; open: boolean; count: number }
  | { locked: false; open: boolean; count: number; items: ReadingItem[] }

const pathOf = (ref: ThreadRef) => (ref.type === 'live' ? 'live/live-show' : `${ref.type}/${ref.id}`)

/** Where the static preview keeps a thread and its reading list. */
async function stored(ref: ThreadRef): Promise<{ thread: Thread; readingList?: ReadingListAnswer }> {
  if (ref.type === 'episode') {
    const place = storedPageOf(ref.id)
    if (!place) throw new Error(`No episode ${ref.id}`)
    const page = await getJson<Record<string, { thread: Thread; readingList: ReadingListAnswer }>>(
      `extras/episodes/${place.showId}/${place.page}.json`,
    )
    const extras = page[ref.id]
    if (!extras) throw new Error(`No episode ${ref.id}`)
    return extras
  }
  return getJson(ref.type === 'article' ? `extras/articles/${ref.id}.json` : 'extras/live/live-show.json')
}

/**
 * Fresh dates, and counts that leave out the viewer's own vote (the vote
 * buttons add it back), so a vote shows the same way before and after saving.
 */
function normaliseComment(comment: Comment, moveBy = 0): Comment {
  const own = comment.myVote
  return {
    ...comment,
    postedAt: new Date(new Date(shiftDate(comment.postedAt)).getTime() + moveBy).toISOString(),
    likes: comment.likes - (own === 'up' ? 1 : 0),
    dislikes: comment.dislikes - (own === 'down' ? 1 : 0),
    replies: comment.replies.map((reply) => normaliseComment(reply, moveBy)),
  }
}

function normaliseThread(thread: Thread, ref: ThreadRef): Thread {
  if (thread.locked) return thread
  // The demo's live show is always on air, so its thread is moved up to
  // now: the newest comment a few minutes old.
  let moveBy = 0
  if (ref.type === 'live' && thread.comments.length) {
    const newest = Math.max(...thread.comments.flatMap((c) => [c, ...c.replies]).map((c) => new Date(shiftDate(c.postedAt)).getTime()))
    moveBy = Math.max(0, Date.now() - 8 * 60_000 - newest)
  }
  return { ...thread, comments: thread.comments.map((c) => normaliseComment(c, moveBy)) }
}

/** GET /api/threads/{type}/{id} */
export async function getThread(ref: ThreadRef): Promise<Thread> {
  const thread = API_MODE === 'laravel' ? await getFresh<Thread>(`threads/${pathOf(ref)}`) : (await stored(ref)).thread
  return normaliseThread(thread, ref)
}

/** GET /api/reading-lists/{type}/{id}, for an episode or the live show. */
export async function getReadingList(ref: ThreadRef): Promise<ReadingListAnswer> {
  if (API_MODE === 'laravel') return getFresh<ReadingListAnswer>(`reading-lists/${pathOf(ref)}`)
  const { readingList } = await stored(ref)
  if (!readingList) throw new Error('No reading list here')
  return readingList
}

/** POST /api/threads/{type}/{id}/comments. Laravel mode only. */
export async function postComment(ref: ThreadRef, text: string, parentId?: string): Promise<Comment> {
  return normaliseComment(await send<Comment>('POST', `threads/${pathOf(ref)}/comments`, { text, parentId }))
}

/** POST /api/comments/{id}/vote. Null takes a vote back. Laravel mode only. */
export function voteOnComment(id: string, direction: Vote | null): Promise<{ likes: number; dislikes: number; myVote: Vote | null }> {
  return send('POST', `comments/${id}/vote`, { direction })
}

export interface ForumTopic {
  title: string
  by: string
  replies: number
  createdAt: string
}

/** GET /api/forums/{community}/{forum}/topics: topics people have started. Laravel mode only. */
export function listForumTopics(forum: string): Promise<ForumTopic[]> {
  return getFresh(`forums/${forum}/topics`)
}

/** POST /api/forums/{community}/{forum}/topics. Laravel mode only. */
export function startForumTopic(forum: string, title: string): Promise<ForumTopic> {
  return send('POST', `forums/${forum}/topics`, { title })
}
