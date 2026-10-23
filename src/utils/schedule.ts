import type { ShowSlot } from '@/types/content'
import { formatLongDate, formatTime } from './format'

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

/** The next start of a show that goes out every day at `hour`: today if still to come, otherwise tomorrow. */
export function nextDailyStart(hour: number, from = new Date()): Date {
  const start = new Date(from)
  start.setHours(hour, 0, 0, 0)
  if (start <= from) start.setDate(start.getDate() + 1)
  return start
}

/** "today at 1:00 pm", "tomorrow at 1:00 pm" or "Monday 26th October at 1:00 pm". */
export function startsLabel(date: Date, today = new Date()): string {
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const time = formatTime(date)
  if (date.toDateString() === today.toDateString()) return `today at ${time}`
  if (date.toDateString() === tomorrow.toDateString()) return `tomorrow at ${time}`
  return `${formatLongDate(date)} at ${time}`
}
