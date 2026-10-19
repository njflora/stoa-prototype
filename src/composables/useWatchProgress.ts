import { computed, ref, watch } from 'vue'
import { getEpisode } from '@/data/catalogue'
import type { Episode } from '@/types/content'
import { readJson, writeJson } from './storage'

// Remembers how far the viewer got in each episode. It powers
// "Continue watching". Kept in the browser for the prototype; a real site
// would sync it to the viewer's account.

interface Progress {
  /** 0 to 1. */
  fraction: number
  updatedAt: number
}

type ProgressMap = Record<string, Progress>

const STORAGE_KEY = 'stoa-progress'
const HOUR_MS = 3_600_000

/** Some starting progress so the demo row is never empty. */
function seed(): ProgressMap {
  const now = Date.now()
  return {
    'stoa-podcast-0': { fraction: 0.42, updatedAt: now - 2 * HOUR_MS },
    'chronos-9': { fraction: 0.68, updatedAt: now - 20 * HOUR_MS },
    'conversations-0': { fraction: 0.2, updatedAt: now - 30 * HOUR_MS },
    'ledger-0': { fraction: 0.55, updatedAt: now - 50 * HOUR_MS },
    'morning-brief-1': { fraction: 0.8, updatedAt: now - 60 * HOUR_MS },
  }
}

const progress = ref<ProgressMap>(readJson(STORAGE_KEY, seed()))

watch(progress, (value) => writeJson(STORAGE_KEY, value), { deep: true })

export function useWatchProgress() {
  /** Started but unfinished episodes, most recent first. */
  const inProgress = computed(() =>
    Object.entries(progress.value)
      .filter(([, p]) => p.fraction > 0.02 && p.fraction < 0.95)
      .sort(([, a], [, b]) => b.updatedAt - a.updatedAt)
      .map(([id, p]) => ({ episode: getEpisode(id), fraction: p.fraction }))
      .filter((item): item is { episode: Episode; fraction: number } => !!item.episode),
  )

  function progressFor(id: string): number {
    return progress.value[id]?.fraction ?? 0
  }

  /** Watched to the end, near enough. */
  function isWatched(id: string): boolean {
    return progressFor(id) >= 0.95
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

  return { inProgress, progressFor, isWatched, setProgress, markWatched, clear, restoreSample }
}
