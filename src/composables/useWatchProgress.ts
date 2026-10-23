import { computed, ref, watch } from 'vue'
import { readJson, writeJson } from './storage'
import { inProgress, isWatchedFraction, type ProgressMap } from '@/utils/progress'

// Remembers how far the viewer got in each episode. It powers
// "Continue watching". Kept in the browser for the prototype; a real site
// would sync it to the viewer's account. It stores only ids: the episodes
// themselves are fetched when needed (getEpisodes in src/api/catalogue.ts).
// The rules for what counts as in progress or watched are in utils/progress.ts.

const STORAGE_KEY = 'stoa-progress'
const HOUR_MS = 3_600_000

/** Some starting progress so the demo row is never empty. */
function seed(): ProgressMap {
  const now = Date.now()
  return {
    // Ids from the generated catalogue (scripts/data/generate.mjs).
    'stoa-podcast-1530': { fraction: 0.42, updatedAt: now - 2 * HOUR_MS },
    'chronos-120': { fraction: 0.68, updatedAt: now - 20 * HOUR_MS },
    'conversations-150': { fraction: 0.2, updatedAt: now - 30 * HOUR_MS },
    'ledger-200': { fraction: 0.55, updatedAt: now - 50 * HOUR_MS },
    'morning-brief-3118': { fraction: 0.8, updatedAt: now - 60 * HOUR_MS },
  }
}

const progress = ref<ProgressMap>(readJson(STORAGE_KEY, seed()))

watch(progress, (value) => writeJson(STORAGE_KEY, value), { deep: true })

export function useWatchProgress() {
  /** Ids of started but unfinished episodes, most recent first (at most 20). */
  const inProgressIds = computed(() => inProgress(progress.value))

  function progressFor(id: string): number {
    return progress.value[id]?.fraction ?? 0
  }

  /** Watched to the end, near enough. */
  function isWatched(id: string): boolean {
    return isWatchedFraction(progressFor(id))
  }

  function setProgress(id: string, fraction: number) {
    progress.value = { ...progress.value, [id]: { fraction, updatedAt: Date.now() } }
  }

  function markWatched(id: string) {
    setProgress(id, 1)
  }

  /** Forget everything, as for a brand-new visitor. */
  function clear() {
    progress.value = {}
  }

  /** Put back the sample progress the demo starts with. */
  function restoreSample() {
    progress.value = seed()
  }

  return { inProgressIds, progressFor, isWatched, setProgress, markWatched, clear, restoreSample }
}
