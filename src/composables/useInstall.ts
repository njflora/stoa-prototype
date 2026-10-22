import { computed, ref } from 'vue'

// Installing the site as an app. Chrome, Edge and Android fire
// `beforeinstallprompt` when the site can be installed; keeping that event
// lets an "Install app" button open the browser's own install dialog later.
// iPhones and iPads have no such event: there, the button explains
// Share, then "Add to Home Screen". Once installed, the option disappears.

/** Chrome's install event. It is not in TypeScript's standard types. */
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const deferred = ref<InstallPromptEvent | null>(null)
const standalone = window.matchMedia('(display-mode: standalone)')
const installed = ref(standalone.matches || (navigator as Navigator & { standalone?: boolean }).standalone === true)

// Listened for as soon as this file loads, so the event is never missed.
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault()
  deferred.value = event as InstallPromptEvent
})
window.addEventListener('appinstalled', () => {
  installed.value = true
  deferred.value = null
})
standalone.addEventListener('change', (event) => (installed.value = event.matches))

/** iPhone or iPad, in Safari or another iOS browser (all use Safari's engine). */
const isIos =
  /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

export function useInstall() {
  /** Show the option: the browser offers install, or it is iOS, and the app is not installed yet. */
  const canOffer = computed(() => !installed.value && (deferred.value !== null || isIos))

  /** Opens the browser's install dialog. Returns false on iOS, where the hint is shown instead. */
  async function install(): Promise<boolean> {
    const event = deferred.value
    if (!event) return false
    await event.prompt()
    const { outcome } = await event.userChoice
    // The event can only be used once either way.
    deferred.value = null
    if (outcome === 'accepted') installed.value = true
    return true
  }

  return { canOffer, isIos, install }
}
