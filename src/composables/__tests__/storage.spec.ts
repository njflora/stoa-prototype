import { afterEach, describe, expect, it, vi } from 'vitest'
import { readJson, writeJson } from '../storage'

// A stand-in for the browser's localStorage, so these run without a browser.
function fakeStorage(initial: Record<string, string> = {}) {
  const items = new Map(Object.entries(initial))
  return {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => void items.set(key, value),
    items,
  }
}

// Storage that refuses everything, as in some private windows or when full.
const blockedStorage = {
  getItem: () => {
    throw new Error('SecurityError')
  },
  setItem: () => {
    throw new Error('QuotaExceededError')
  },
}

afterEach(() => vi.unstubAllGlobals())

describe('readJson', () => {
  it('reads a saved value', () => {
    vi.stubGlobal('localStorage', fakeStorage({ key: '{"a":1}' }))
    expect(readJson('key', {})).toEqual({ a: 1 })
  })

  it.each([
    ['nothing saved', fakeStorage()],
    ['broken saved data', fakeStorage({ key: '{not json' })],
    ['blocked storage', blockedStorage],
  ])('falls back with %s', (_, storage) => {
    vi.stubGlobal('localStorage', storage)
    expect(readJson('key', ['fallback'])).toEqual(['fallback'])
  })
})

describe('writeJson', () => {
  it('saves a value as JSON', () => {
    const storage = fakeStorage()
    vi.stubGlobal('localStorage', storage)
    writeJson('key', { a: 1 })
    expect(storage.items.get('key')).toBe('{"a":1}')
  })

  it('does not throw when storage is blocked or full', () => {
    vi.stubGlobal('localStorage', blockedStorage)
    expect(() => writeJson('key', { a: 1 })).not.toThrow()
  })
})
