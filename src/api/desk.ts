// The content desk: every episode and the state of its link on each
// platform, for staff. In Laravel mode the server answers (staff only) and
// Re-sync runs the platform sync for real. The static preview reads the
// exported pages, and its Re-sync applies the result the export recorded
// (the same sync, run against the same sample feeds, with the desk's pages
// as they stood afterwards), saved in this browser.

import { API_MODE, getFresh, getJson, query, send } from './client'
import { shiftDate } from './catalogue'
import { readJson, writeJson } from '@/composables/storage'
import type { EpisodeSource, Platform, SourceStatus } from '@/data/streams'

export type DeskFilter = 'all' | 'problems' | `${Platform}-${Exclude<SourceStatus, 'linked'>}`

export interface DeskRow {
  id: string
  showId: string
  title: string | null
  edition?: boolean
  publishedAt: string
  access: string
  sources: EpisodeSource[]
}

/** How many links each platform has in each state. */
export type DeskSummary = Record<Platform, Record<SourceStatus, number>>

export interface IngestRun {
  id: number
  platform: Platform
  fixtures: boolean
  status: 'running' | 'ok' | 'failed'
  fetched: number
  matched: number
  linked: number
  unmatched: number
  /** The titles that were not episodes, or the error. */
  notes: string[]
  startedAt: string
  finishedAt: string | null
}

export interface DeskPage {
  page: number
  pageCount: number
  total: number
  items: DeskRow[]
  summary: DeskSummary
  runs: IngestRun[]
}

/** A link the sync changed, with its episode. */
type Change = EpisodeSource & { episodeId: string }

interface SavedSync {
  runs: IngestRun[]
  changes: Change[]
  summary: DeskSummary
}

const SYNC_KEY = 'stoa-desk-sync'
const savedSync = () => readJson<SavedSync | null>(SYNC_KEY, null)

/** Snapshot dates move forward to now, like everything else in the catalogue. */
const fresh = (run: IngestRun): IngestRun => ({
  ...run,
  startedAt: shiftDate(run.startedAt),
  finishedAt: run.finishedAt && shiftDate(run.finishedAt),
})

/** GET /api/desk?filter=&page= */
export async function getDesk(filter: DeskFilter, page: number): Promise<DeskPage> {
  if (API_MODE === 'laravel') {
    const data = await getFresh<DeskPage>(`desk?${query({ filter, page })}`)
    return {
      ...data,
      items: data.items.map((r) => ({ ...r, publishedAt: shiftDate(r.publishedAt) })),
      runs: data.runs.map(fresh),
    }
  }

  // The static preview: the stored page, or after this browser's re-sync
  // the page as it stood after the export's sync. A filter with nothing
  // left in it has no stored page.
  const sync = savedSync()
  const [stored, summary, runs] = await Promise.all([
    getJson<Omit<DeskPage, 'summary' | 'runs'>>(`desk/${sync ? 'synced/' : ''}${filter}/${page}.json`).catch(() => ({
      page,
      pageCount: 1,
      total: 0,
      items: [],
    })),
    getJson<DeskSummary>('desk/summary.json'),
    getJson<IngestRun[]>('desk/runs.json'),
  ])
  // Links made by this browser's re-sync were made just now.
  const changed = new Map((sync?.changes ?? []).map((c) => [`${c.episodeId}|${c.platform}`, c]))
  const items = stored.items.map((row) => ({
    ...row,
    publishedAt: shiftDate(row.publishedAt),
    sources: row.sources.map((s) => {
      const change = changed.get(`${row.id}|${s.platform}`)
      return change ? { ...s, syncedAt: change.syncedAt } : s
    }),
  }))
  return {
    ...stored,
    items,
    summary: sync?.summary ?? summary,
    runs: [...(sync?.runs ?? []), ...runs.map(fresh)],
  }
}

/** POST /api/desk/sync: sync every platform now. Returns the new runs. */
export async function resync(): Promise<IngestRun[]> {
  if (API_MODE === 'laravel') {
    const result = await send<{ runs: IngestRun[] }>('POST', 'desk/sync')
    return result.runs
  }
  const now = new Date().toISOString()
  const recorded = await getJson<SavedSync>('desk/sync.json')
  const runs = recorded.runs.map((r, i) => ({ ...r, id: Date.now() + i, startedAt: now, finishedAt: now }))
  writeJson(SYNC_KEY, {
    runs,
    changes: recorded.changes.map((c) => ({ ...c, syncedAt: now })),
    summary: recorded.summary,
  })
  return runs
}

/** The static preview's re-sync, applied to one episode's sources (used by the player). */
export function withSavedSync(episodeId: string, sources: EpisodeSource[]): EpisodeSource[] {
  const changes = savedSync()?.changes.filter((c) => c.episodeId === episodeId) ?? []
  return sources.map((s) => {
    const change = changes.find((c) => c.platform === s.platform)
    if (!change) return s
    const { episodeId: _, ...source } = change
    return { ...s, ...source }
  })
}
