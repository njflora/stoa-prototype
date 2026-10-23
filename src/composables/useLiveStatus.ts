import { computed, onMounted, onUnmounted, ref } from 'vue'
import { getLiveEvent } from '@/data/catalogue'
import { formatCountdown } from '@/utils/format'
import { nextDailyStart } from '@/utils/schedule'
import { useViewer } from './useViewer'

/** The current time, refreshed every `intervalMs` while the component is on screen. */
function useNow(intervalMs: number) {
  const now = ref(new Date())
  let timer: ReturnType<typeof setInterval> | undefined

  onMounted(() => {
    timer = setInterval(() => (now.value = new Date()), intervalMs)
  })
  onUnmounted(() => clearInterval(timer))

  return now
}

/** Whether the flagship show is live, and a countdown to the next one if not. */
export function useLiveStatus() {
  const { isLive, phase } = useViewer()
  const now = useNow(1000)

  const nextStart = computed(() => nextDailyStart(getLiveEvent().startHour, now.value))

  const countdown = computed(() => formatCountdown(nextStart.value.getTime() - now.value.getTime()))

  return { isLive, phase, event: getLiveEvent(), nextStart, countdown, now }
}
