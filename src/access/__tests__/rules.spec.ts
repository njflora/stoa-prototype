import { describe, expect, it } from 'vitest'
import { canPost, canRead, canWatch, type AccessViewer } from '../rules'

// Every kind of viewer the site knows. "buyer" is a free account that
// bought one members' episode, "bought-1".
const viewers = {
  'signed out': { signedIn: false, member: false, owns: () => false },
  'free account': { signedIn: true, member: false, owns: () => false },
  buyer: { signedIn: true, member: false, owns: (id) => id === 'bought-1' },
  member: { signedIn: true, member: true, owns: () => false },
} satisfies Record<string, AccessViewer>

type ViewerName = keyof typeof viewers

describe('canWatch', () => {
  const free = { id: 'free-1', access: 'free' } as const
  const preview = { id: 'preview-1', access: 'freemium' } as const
  const premium = { id: 'premium-1', access: 'premium' } as const
  const bought = { id: 'bought-1', access: 'premium' } as const

  it.each<[ViewerName, boolean, boolean, boolean, boolean]>([
    // viewer          free  preview premium bought
    ['signed out', true, true, false, false],
    ['free account', true, true, false, false],
    ['buyer', true, true, false, true],
    ['member', true, true, true, true],
  ])('%s: free %s, preview %s, premium %s, bought %s', (name, toFree, toPreview, toPremium, toBought) => {
    const viewer = viewers[name]
    expect(canWatch(viewer, free)).toBe(toFree)
    expect(canWatch(viewer, preview)).toBe(toPreview)
    expect(canWatch(viewer, premium)).toBe(toPremium)
    expect(canWatch(viewer, bought)).toBe(toBought)
  })

  it('needs a signed-in account for a purchase to count', () => {
    // A stale purchase list after signing out must not unlock anything.
    const signedOutWithPurchase = { signedIn: false, member: false, owns: () => true }
    expect(canWatch(signedOutWithPurchase, bought)).toBe(false)
  })

  it('unlocks only the episode that was bought', () => {
    expect(canWatch(viewers.buyer, bought)).toBe(true)
    expect(canWatch(viewers.buyer, premium)).toBe(false)
  })
})

describe('canRead and canPost', () => {
  const open = { open: true }
  const membersOnly = { open: false }

  it.each<[ViewerName, boolean, boolean, boolean, boolean]>([
    // viewer          read open  read members  post open  post members
    ['signed out', true, false, false, false],
    ['free account', true, false, true, false],
    ['buyer', true, false, true, false],
    ['member', true, true, true, true],
  ])('%s: read open %s, read members %s, post open %s, post members %s', (name, ro, rm, po, pm) => {
    const viewer = viewers[name]
    expect(canRead(viewer, open)).toBe(ro)
    expect(canRead(viewer, membersOnly)).toBe(rm)
    expect(canPost(viewer, open)).toBe(po)
    expect(canPost(viewer, membersOnly)).toBe(pm)
  })

  it('never lets someone post where they cannot read', () => {
    for (const viewer of Object.values(viewers)) {
      for (const thread of [open, membersOnly]) {
        if (canPost(viewer, thread)) expect(canRead(viewer, thread)).toBe(true)
      }
    }
  })
})
