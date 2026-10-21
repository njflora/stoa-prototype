import { ref } from 'vue'

// Whether the browser has a connection, kept up to date by its online and
// offline events. One shared value for the whole site.
//
// `missedOffline` is set when a page's data could not load because the
// connection is gone and the page was never saved for offline use. App.vue
// then shows the offline notice in place of the page.

const online = ref(navigator.onLine)
const missedOffline = ref(false)

window.addEventListener('online', () => {
  online.value = true
  missedOffline.value = false
})
window.addEventListener('offline', () => (online.value = false))

/** A request failed: if the connection is gone, show the offline notice. */
export function noteFailedRequest(): void {
  if (!navigator.onLine) missedOffline.value = true
}

export function useOnline() {
  return { online, missedOffline }
}
