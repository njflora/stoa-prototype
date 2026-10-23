// Who may watch, read and post: the access rules as the browser applies them.
//
// The server is the authority. These mirror its policies, condition for
// condition, so the static preview gates the same way:
// - canWatch: backend/app/Policies/EpisodePolicy.php (watch)
// - canRead, canPost: backend/app/Policies/ThreadPolicy.php (read, post)
// In Laravel mode the server's answer wins; the site uses these where it has
// no answer from the server. Change both sides together.

import type { Access } from '@/types/content'

/** Who is asking. Staff count as members. */
export interface AccessViewer {
  signedIn: boolean
  member: boolean
  /** Members' episodes this account bought one at a time. */
  owns: (episodeId: string) => boolean
}

/**
 * Free episodes and free previews ("freemium") are for everyone. Members'
 * episodes are for members, and for a signed-in account that bought that
 * one episode.
 */
export function canWatch(viewer: AccessViewer, episode: { id: string; access: Access }): boolean {
  return episode.access !== 'premium' || viewer.member || (viewer.signedIn && viewer.owns(episode.id))
}

/** Open threads are for everyone. Members-only threads and their reading lists are for members. */
export function canRead(viewer: AccessViewer, thread: { open: boolean }): boolean {
  return thread.open || viewer.member
}

/** Posting needs an account: any account in an open thread, a member in a members-only one. */
export function canPost(viewer: AccessViewer, thread: { open: boolean }): boolean {
  return viewer.signedIn && (thread.open || viewer.member)
}
