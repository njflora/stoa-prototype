// Builds a calendar file (.ics) for one event and hands it to the browser
// to save. Every calendar app can open it, so "Add to calendar" works
// without accounts or notifications.

interface CalendarEvent {
  title: string
  start: Date
  durationMin: number
  description: string
  url: string
}

/** 2026-10-19T13:00:00Z → 20261019T130000Z */
function icsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

/** Escapes the characters that have meaning in .ics text fields. */
function icsText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

export function downloadCalendarEvent(event: CalendarEvent): void {
  const end = new Date(event.start.getTime() + event.durationMin * 60_000)
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Stoa prototype//EN',
    'BEGIN:VEVENT',
    `UID:${event.start.getTime()}@stoa.example`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(event.start)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${icsText(event.title)}`,
    `DESCRIPTION:${icsText(event.description)}`,
    `URL:${event.url}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT10M',
    'ACTION:DISPLAY',
    `DESCRIPTION:${icsText(event.title)} starts in 10 minutes`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${event.title.replace(/[^\w]+/g, '-').toLowerCase()}.ics`
  link.click()
  // Free the temporary link once the browser has started the download.
  setTimeout(() => URL.revokeObjectURL(link.href), 1000)
}
