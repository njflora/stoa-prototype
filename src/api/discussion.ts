// Comments, reading lists and forum topics, in both modes.
//
// - Laravel mode: each answer depends on who is signed in. Someone who may
//   not see a members' thread gets only its count, and every post and vote
//   is saved on the account.
// - Static preview: the files hold every thread as a member sees it, and the
//   page applies the members' gate itself. Posts, votes and forum topics are
//   saved in this browser, so a reload keeps them, as the real site would.
//
// Pages call the same functions either way.

import { API_MODE, getFresh, getJson, send } from './client'
import { shiftDate, storedPageOf } from './catalogue'
import type { ChatTier } from '@/data/chat'
import type { Comment } from '@/data/comments'
import type { ReadingItem } from '@/data/readingLists'
import type { EpisodeSource } from '@/data/streams'
import { readJson, writeJson } from '@/composables/storage'
import type { Vote } from '@/types/content'

/** Which discussion: an episode's, an article's or the live show's. */
export type ThreadRef = { type: 'episode'; id: string } | { type: 'article'; id: string } | { type: 'live' }

/** A thread as the viewer may see it. Locked (Laravel mode only): a count and nothing else. */
export type Thread =
  | { locked: true; open: boolean; count: number }
  | { locked: false; open: boolean; count: number; canPost?: boolean; comments: Comment[] }

/** Where to watch an episode. Locked: nothing at all, not even which platforms. */
export type PlayAnswer = { locked: true } | { locked: false; sources: EpisodeSource[] }

export type ReadingListAnswer =
  | { locked: true; open: boolean; count: number }
  | { locked: false; open: boolean; count: number; items: ReadingItem[] }

/** Who is posting, for posts saved in the browser. */
export interface Author {
  name: string
  tier: ChatTier
}

const pathOf = (ref: ThreadRef) => (ref.type === 'live' ? 'live/live-show' : `${ref.type}/${ref.id}`)
const keyOf = (ref: ThreadRef) => (ref.type === 'live' ? 'live:live-show' : `${ref.type}:${ref.id}`)

// ---------- the static preview's saved changes ----------

/** Posts made in this browser, by thread: new comments, and replies to a comment. */
type SavedPost = { parentId?: string; comment: Comment }
const POSTS_KEY = 'stoa-posts'
const VOTES_KEY = 'stoa-votes'
const TOPICS_KEY = 'stoa-forum-topics'

/** What the static preview stores for each episode, grouped by archive page. */
export interface StoredExtras {
  thread: Thread
  readingList: ReadingListAnswer
  play: PlayAnswer
}

/** An episode's comments, reading list and sources in the static preview. */
export async function storedExtras(episodeId: string): Promise<StoredExtras> {
  const place = storedPageOf(episodeId)
  if (!place) throw new Error(`No episode ${episodeId}`)
  const page = await getJson<Record<string, StoredExtras>>(`extras/episodes/${place.showId}/${place.page}.json`)
  const extras = page[episodeId]
  if (!extras) throw new Error(`No episode ${episodeId}`)
  return extras
}

/** Where the static preview keeps a thread and its reading list. */
async function stored(ref: ThreadRef): Promise<{ thread: Thread; readingList?: ReadingListAnswer }> {
  if (ref.type === 'episode') return storedExtras(ref.id)
  return getJson(ref.type === 'article' ? `extras/articles/${ref.id}.json` : 'extras/live/live-show.json')
}

/** Adds this browser's posts and votes to a thread from the static files. */
function withSavedChanges(thread: Thread, ref: ThreadRef): Thread {
  if (thread.locked) return thread
  const posts = readJson<Record<string, SavedPost[]>>(POSTS_KEY, {})[keyOf(ref)] ?? []
  const votes = readJson<Record<string, Vote>>(VOTES_KEY, {})
  const comments = thread.comments.map((c) => ({ ...c, replies: [...c.replies] }))
  for (const { parentId, comment } of posts) {
    if (!parentId) comments.unshift({ ...comment, replies: [] })
    else comments.find((c) => c.id === parentId)?.replies.push(comment)
  }
  const voted = (c: Comment): Comment => ({ ...c, myVote: votes[c.id], replies: c.replies.map(voted) })
  const withVotes = comments.map(voted)
  return { ...thread, comments: withVotes, count: withVotes.reduce((n, c) => n + 1 + c.replies.length, 0) }
}

// ---------- reading ----------

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
  if (API_MODE === 'laravel') return normaliseThread(await getFresh<Thread>(`threads/${pathOf(ref)}`), ref)
  // Saved posts already have real times, so they are added after the dates move.
  return withSavedChanges(normaliseThread((await stored(ref)).thread, ref), ref)
}

/** GET /api/reading-lists/{type}/{id}, for an episode or the live show. */
export async function getReadingList(ref: ThreadRef): Promise<ReadingListAnswer> {
  if (API_MODE === 'laravel') return getFresh<ReadingListAnswer>(`reading-lists/${pathOf(ref)}`)
  const { readingList } = await stored(ref)
  if (!readingList) throw new Error('No reading list here')
  return readingList
}

/**
 * GET /api/episodes/{id}/play: the episode's platforms. In Laravel mode a
 * viewer who may not watch gets `{ locked: true }`; the static preview holds
 * every episode's sources and the page checks who can watch.
 */
export async function getPlay(episodeId: string): Promise<PlayAnswer> {
  if (API_MODE === 'laravel') return getFresh<PlayAnswer>(`episodes/${episodeId}/play`)
  return (await storedExtras(episodeId)).play
}

// ---------- changes ----------

/** POST /api/threads/{type}/{id}/comments, or saved in this browser. */
export async function postComment(ref: ThreadRef, text: string, author: Author, parentId?: string): Promise<Comment> {
  if (API_MODE === 'laravel') {
    return normaliseComment(await send<Comment>('POST', `threads/${pathOf(ref)}/comments`, { text, parentId }))
  }
  const comment: Comment = {
    id: `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    user: author.name,
    tier: author.tier,
    postedAt: new Date().toISOString(),
    text,
    likes: 0,
    dislikes: 0,
    replies: [],
    mine: true,
  }
  const posts = readJson<Record<string, SavedPost[]>>(POSTS_KEY, {})
  posts[keyOf(ref)] = [...(posts[keyOf(ref)] ?? []), { parentId, comment }]
  writeJson(POSTS_KEY, posts)
  return comment
}

/** POST /api/comments/{id}/vote, or saved in this browser. Null takes a vote back. */
export async function voteOnComment(id: string, direction: Vote | null): Promise<void> {
  if (API_MODE === 'laravel') {
    await send('POST', `comments/${id}/vote`, { direction })
    return
  }
  const votes = readJson<Record<string, Vote>>(VOTES_KEY, {})
  if (direction) votes[id] = direction
  else delete votes[id]
  writeJson(VOTES_KEY, votes)
}

export interface ForumTopic {
  title: string
  by: string
  replies: number
  createdAt: string
}

/** GET /api/forums/{community}/{forum}/topics: topics people have started, newest first. */
export async function listForumTopics(forum: string): Promise<ForumTopic[]> {
  if (API_MODE === 'laravel') return getFresh(`forums/${forum}/topics`)
  return readJson<Record<string, ForumTopic[]>>(TOPICS_KEY, {})[forum] ?? []
}

/** POST /api/forums/{community}/{forum}/topics, or saved in this browser. */
export async function startForumTopic(forum: string, title: string, author: Author): Promise<ForumTopic> {
  if (API_MODE === 'laravel') return send('POST', `forums/${forum}/topics`, { title })
  const topic: ForumTopic = { title, by: author.name, replies: 0, createdAt: new Date().toISOString() }
  const topics = readJson<Record<string, ForumTopic[]>>(TOPICS_KEY, {})
  topics[forum] = [topic, ...(topics[forum] ?? [])]
  writeJson(TOPICS_KEY, topics)
  return topic
}
