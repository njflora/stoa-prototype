// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { canWatch } from '@/access/rules'
import type { ViewerType } from '../useViewer'

// Buying one members' episode in the static preview: kept in this browser,
// and checked by the same access rule the site uses. Each load() is a fresh
// page load as the given viewer.

const bought = { id: 'chronos-116', access: 'premium' } as const
const other = { id: 'chronos-117', access: 'premium' } as const

async function load(viewer: ViewerType) {
  vi.resetModules()
  localStorage.setItem('stoa-demo', JSON.stringify({ viewer, phase: 'live' }))
  const { usePurchases } = await import('../usePurchases')
  const { useViewer } = await import('../useViewer')
  return { ...usePurchases(), access: useViewer().access }
}

beforeEach(() => localStorage.clear())

describe('usePurchases', () => {
  it('starts with nothing bought', async () => {
    const { owned } = await load('free')
    expect(owned.value).toEqual([])
  })

  it('keeps each episode once, newest first', async () => {
    const { buy, owned } = await load('free')
    await buy('chronos-116')
    await buy('chronos-117')
    await buy('chronos-116')
    expect(owned.value).toEqual(['chronos-117', 'chronos-116'])
  })

  it('remembers a purchase after a reload', async () => {
    const { buy } = await load('free')
    await buy(bought.id)
    await nextTick()
    const { isOwned } = await load('free')
    expect(isOwned(bought.id)).toBe(true)
  })

  it('unlocks the bought episode, and only that one, for a free account', async () => {
    const { buy, access } = await load('free')
    await buy(bought.id)
    expect(canWatch(access.value, bought)).toBe(true)
    expect(canWatch(access.value, other)).toBe(false)
  })

  it('unlocks nothing once signed out, even with a purchase saved in this browser', async () => {
    const { buy } = await load('free')
    await buy(bought.id)
    await nextTick()
    const { access, isOwned } = await load('signed-out')
    expect(isOwned(bought.id)).toBe(true)
    expect(canWatch(access.value, bought)).toBe(false)
  })
})
