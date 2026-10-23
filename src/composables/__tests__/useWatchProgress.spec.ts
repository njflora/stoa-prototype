// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

// Watch progress as a visitor to the static preview sees it: kept in this
// browser, so it survives a reload. Each load() is a fresh page load.

const KEY = 'stoa-progress'

async function load() {
  vi.resetModules()
  const { useWatchProgress } = await import('../useWatchProgress')
  return useWatchProgress()
}

beforeEach(() => localStorage.clear())
afterEach(() => vi.useRealTimers())

describe('useWatchProgress', () => {
  it('gives a first-time visitor a sample "Continue watching" row', async () => {
    const progress = await load()
    expect(progress.inProgressIds.value.length).toBeGreaterThan(0)
  })

  it('picks up progress saved on an earlier visit', async () => {
    localStorage.setItem(KEY, JSON.stringify({ 'ep-1': { fraction: 0.4, updatedAt: 1 } }))
    const progress = await load()
    expect(progress.inProgressIds.value).toEqual(['ep-1'])
    expect(progress.progressFor('ep-1')).toBe(0.4)
  })

  it('saves progress, so it survives a reload', async () => {
    const progress = await load()
    progress.clear()
    progress.setProgress('ep-2', 0.3)
    await nextTick()

    const reloaded = await load()
    expect(reloaded.progressFor('ep-2')).toBe(0.3)
    expect(reloaded.inProgressIds.value).toEqual(['ep-2'])
  })

  it('moves the episode watched most recently to the front', async () => {
    vi.useFakeTimers()
    const progress = await load()
    progress.clear()
    vi.setSystemTime(new Date(2026, 9, 23, 10))
    progress.setProgress('morning', 0.5)
    vi.setSystemTime(new Date(2026, 9, 23, 20))
    progress.setProgress('evening', 0.5)
    expect(progress.inProgressIds.value).toEqual(['evening', 'morning'])
  })

  it('ticks a finished episode and takes it out of "Continue watching"', async () => {
    const progress = await load()
    progress.clear()
    progress.setProgress('ep-3', 0.5)
    progress.markWatched('ep-3')
    expect(progress.isWatched('ep-3')).toBe(true)
    expect(progress.inProgressIds.value).not.toContain('ep-3')
  })

  it('forgets everything when cleared, even after a reload', async () => {
    const progress = await load()
    progress.clear()
    await nextTick()
    expect((await load()).inProgressIds.value).toEqual([])
  })
})
