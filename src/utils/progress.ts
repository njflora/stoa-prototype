// The rules behind "Continue watching" and the watched ticks: when an
// episode counts as started, in progress or watched. useWatchProgress keeps
// the data; these decide what it means.

export interface Progress {
  /** 0 to 1. */
  fraction: number
  updatedAt: number
}

export type ProgressMap = Record<string, Progress>

/** Up to here, an episode was only opened, not started. */
export const STARTED_AFTER = 0.02
/** From here, an episode counts as watched: the closing credits are not needed. */
export const WATCHED_FROM = 0.95
/** The most episodes "Continue watching" lists. */
export const CONTINUE_LIMIT = 20

export function isWatchedFraction(fraction: number): boolean {
  return fraction >= WATCHED_FROM
}

/** Ids of started but unfinished episodes, most recent first. */
export function inProgress(progress: ProgressMap, limit = CONTINUE_LIMIT): string[] {
  return Object.entries(progress)
    .filter(([, p]) => p.fraction > STARTED_AFTER && !isWatchedFraction(p.fraction))
    .sort(([, a], [, b]) => b.updatedAt - a.updatedAt)
    .slice(0, limit)
    .map(([id]) => id)
}
