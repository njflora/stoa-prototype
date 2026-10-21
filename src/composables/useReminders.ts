import { ref, watch } from 'vue'
import { readJson, writeJson } from './storage'
import { useViewer } from './useViewer'
import { brand } from '@/config/brand'

// Live reminders through browser notifications, a members' perk.
//
// Limit of the prototype: a web page can only show a notification while
// the site is open in a tab. Reminders that arrive with the site closed
// need Web Push (a server plus a service worker), which belongs with the
// installable PWA work. Some phone browsers also only allow notifications
// from a service worker, so there the confirmation may not appear.

export interface ReminderTarget {
  /** The show's id, such as "stoa-podcast". */
  id: string
  title: string
  start: Date
}

export type NotificationSupport = 'unsupported' | NotificationPermission

const STORAGE_KEY = 'stoa-reminders'
/** The longest delay setTimeout accepts, about 24.8 days. */
const MAX_DELAY_MS = 2_147_483_647
const ICON = `${import.meta.env.BASE_URL}favicon.ico`

const reminders = ref<string[]>(readJson<string[]>(STORAGE_KEY, []))
watch(reminders, (value) => writeJson(STORAGE_KEY, value), { deep: true })

const permission = ref<NotificationSupport>(
  typeof Notification === 'undefined' ? 'unsupported' : Notification.permission,
)
const timers = new Map<string, ReturnType<typeof setTimeout>>()

function notify(title: string, body: string) {
  if (permission.value !== 'granted') return
  try {
    new Notification(title, { body, icon: ICON, tag: title })
  } catch {
    // This browser only allows notifications from a service worker.
  }
}

function liveNow(title: string) {
  notify(`${title} is live now`, `Open ${brand.name} to watch.`)
}

/** Notifies at the start time, as long as the site is still open. */
function schedule(target: ReminderTarget) {
  clearTimeout(timers.get(target.id))
  const delay = target.start.getTime() - Date.now()
  if (delay <= 0 || delay > MAX_DELAY_MS) return
  timers.set(
    target.id,
    setTimeout(() => liveNow(target.title), delay),
  )
}

/**
 * Demo: moving the show to Live in the demo panel fires the real
 * notification, so the reminder can be shown in a pitch. Called once, in main.ts.
 */
let started = false
export function startReminders() {
  if (started) return
  started = true
  const { phase, isMember } = useViewer()
  watch(phase, (next) => {
    if (!isMember.value || !reminders.value.includes('stoa-podcast')) return
    if (next === 'live') liveNow('The Stoa Podcast')
    if (next === 'members') liveNow("The Stoa Podcast members' after-show")
  })
}

export function useReminders() {
  function isOn(id: string): boolean {
    return reminders.value.includes(id)
  }

  async function turnOn(target: ReminderTarget) {
    if (permission.value === 'unsupported') return
    if (permission.value === 'default') {
      permission.value = await Notification.requestPermission()
    }
    if (permission.value !== 'granted') return

    if (!isOn(target.id)) reminders.value = [...reminders.value, target.id]
    schedule(target)
    notify('Reminder set', `We'll tell you when ${target.title} goes live.`)
  }

  function turnOff(id: string) {
    reminders.value = reminders.value.filter((r) => r !== id)
    clearTimeout(timers.get(id))
    timers.delete(id)
  }

  /** Re-creates the timer after a page load, for reminders already on. */
  function restore(target: ReminderTarget) {
    if (isOn(target.id) && permission.value === 'granted') schedule(target)
  }

  return { permission, reminders, isOn, turnOn, turnOff, restore }
}
