// Seeded randomness for placeholder data. The same seed always gives the
// same sequence, so generated content stays the same on every visit.

/** Turns a string, such as an episode id, into a 32-bit seed. */
export function hashString(value: string): number {
  let hash = 2166136261
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

/** A small, fast generator (mulberry32). Returns numbers from 0 up to 1. */
export function seededRandom(seed: string): () => number {
  let state = hashString(seed)
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** A whole number from min to max, inclusive. */
export function randomInt(random: () => number, min: number, max: number): number {
  return min + Math.floor(random() * (max - min + 1))
}

/** `count` different items from a list, in a shuffled order. */
export function pickSome<T>(random: () => number, items: readonly T[], count: number): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j]!, copy[i]!]
  }
  return copy.slice(0, Math.min(count, copy.length))
}
