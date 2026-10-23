import { describe, expect, it } from 'vitest'
import { liveChatMode, liveStatusText, livePhases, type LiveChatMode, type LivePhase } from '../live'

describe('liveChatMode', () => {
  it.each<[LivePhase, LiveChatMode, LiveChatMode]>([
    // phase       non-member  member
    ['upcoming', 'closed', 'closed'],
    ['live', 'live', 'live'],
    ['break', 'live', 'live'],
    ['members', 'locked', 'live'],
    ['ended', 'replay', 'replay'],
  ])('%s: %s for non-members, %s for members', (phase, nonMember, member) => {
    expect(liveChatMode(phase, false)).toBe(nonMember)
    expect(liveChatMode(phase, true)).toBe(member)
  })

  it('locks the chat for non-members only during the after-show', () => {
    const locked = livePhases.filter((p) => liveChatMode(p.id, false) === 'locked').map((p) => p.id)
    expect(locked).toEqual(['members'])
  })
})

describe('liveStatusText', () => {
  it('gives the start time before the show', () => {
    expect(liveStatusText('upcoming', 'today at 1:00 pm')).toBe('Starts today at 1:00 pm')
  })

  it('has a line for every phase', () => {
    for (const { id } of livePhases) expect(liveStatusText(id, 'today at 1:00 pm')).not.toBe('')
  })

  it('says the free stream is free, and the after-show is for members', () => {
    expect(liveStatusText('live', '')).toContain('Free for everyone')
    expect(liveStatusText('members', '')).toContain("Members' after-show")
  })
})
