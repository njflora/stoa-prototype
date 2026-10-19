import { ref } from 'vue'
import type { Vote } from '@/types/content'

// The viewer's own votes, by item id. One vote per item: voting the same
// way again removes it, voting the other way switches it. Kept in the page
// only; a real site would save votes to the viewer's account.

export function useVotes() {
  const votes = ref<Record<string, Vote>>({})

  function vote(id: string, direction: Vote) {
    const next = { ...votes.value }
    if (next[id] === direction) delete next[id]
    else next[id] = direction
    votes.value = next
  }

  function voteFor(id: string): Vote | null {
    return votes.value[id] ?? null
  }

  /** Stored counts plus the viewer's own vote. */
  function totals(id: string, likes: number, dislikes: number) {
    const own = votes.value[id]
    return {
      likes: likes + (own === 'up' ? 1 : 0),
      dislikes: dislikes + (own === 'down' ? 1 : 0),
    }
  }

  return { votes, vote, voteFor, totals }
}

/**
 * Controversial score: lots of votes, split close to evenly. Total votes
 * raised to the power of the balance (smaller count over larger), the
 * approach Reddit popularised. 40 up and 35 down scores far above 50 and 2.
 */
export function controversy(likes: number, dislikes: number): number {
  if (likes === 0 || dislikes === 0) return 0
  const balance = Math.min(likes, dislikes) / Math.max(likes, dislikes)
  return (likes + dislikes) ** balance
}
