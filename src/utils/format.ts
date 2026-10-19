const DAY_MS = 86_400_000

const shortDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })
const longDate = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})
const number = new Intl.NumberFormat('en-GB')

/** "Today", "Yesterday", "3 days ago", then "12 Oct". */
export function formatRelativeDate(iso: string, now = new Date()): string {
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)
  const date = new Date(iso)
  const days = Math.floor((startOfToday.getTime() - date.getTime()) / DAY_MS) + 1

  if (date >= startOfToday) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return shortDate.format(date)
}

/** "Just now", "5 minutes ago", "2 hours ago", "3 days ago", then "12 Oct". */
export function formatTimeAgo(iso: string, now = new Date()): string {
  const minutes = Math.floor((now.getTime() - new Date(iso).getTime()) / 60_000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`
  return shortDate.format(new Date(iso))
}

/** "Monday 19 October". */
export function formatLongDate(date: Date): string {
  return longDate.format(date).replace(',', '')
}

/** "2h 14m", or "14m 05s" in the last hour. */
export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`
}

/** Seconds as a video timestamp: "4:05" or "1:02:03". */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(s / 3600)
  const minutes = Math.floor((s % 3600) / 60)
  const seconds = String(s % 60).padStart(2, '0')
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${seconds}` : `${minutes}:${seconds}`
}

/** "13:00". */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export function formatNumber(value: number): string {
  return number.format(value)
}

export function toRoman(value: number): string {
  const numerals: [number, string][] = [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ]
  let rest = value
  let out = ''
  for (const [amount, numeral] of numerals) {
    while (rest >= amount) {
      out += numeral
      rest -= amount
    }
  }
  return out
}
