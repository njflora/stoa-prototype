import type { ShowSlot } from '@/types/content'

/** The next time a show's slot comes round, after `from`. */
export function nextOccurrence(slot: ShowSlot, from = new Date()): Date {
  for (let ahead = 0; ahead <= 7; ahead++) {
    const date = new Date(from)
    date.setDate(from.getDate() + ahead)
    date.setHours(slot.hour, slot.minute, 0, 0)
    if (slot.days.includes(date.getDay()) && date > from) return date
  }
  // Unreachable with at least one day in the slot; a week ahead as a fallback.
  return new Date(from.getTime() + 7 * 86_400_000)
}
