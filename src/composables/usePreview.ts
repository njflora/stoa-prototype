import {
  computed,
  inject,
  onMounted,
  onUnmounted,
  provide,
  ref,
  useId,
  type InjectionKey,
  type Ref,
} from 'vue'

// Hover previews, as on YouTube: a card sits still until you rest on it,
// then it "plays".
// - Mouse: hover for a moment (a short delay, so sweeping across a row does
//   not start every card). One card plays at a time across the page.
// - Keyboard: focusing a card plays it straight away.
// - Phones (no hover): the first fully visible card in each row plays.
// - "Reduce motion": nothing plays.
// Whether a card may play at all (free content, or any content for
// members) is decided by the card and passed in as `allowed`.

const HOVER_DELAY_MS = 450

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const noHover = window.matchMedia('(hover: none)').matches

/** The card playing on a device with a mouse. One at a time, page-wide. */
const activeId = ref<string | null>(null)

/** Previews start muted. One setting for every card, page-wide. */
const previewMuted = ref(true)

/** The previews' sound setting, for the mute button on each card. */
export function usePreviewSound() {
  return { muted: previewMuted, toggle: () => (previewMuted.value = !previewMuted.value) }
}

interface RowPreview {
  register: (id: string, el: Element) => () => void
  current: Ref<string | null>
}

// provide/inject: a row shares one tracker with every card inside it,
// without passing props through each layer in between.
const ROW_KEY: InjectionKey<RowPreview> = Symbol('row-preview')

/** Called by a row of cards. On phones, picks the card to play. */
export function provideRowPreview() {
  const order: string[] = []
  const ratios = new Map<string, number>()
  const ids = new Map<Element, string>()
  const current = ref<string | null>(null)
  let observer: IntersectionObserver | undefined

  if (noHover && !reduceMotion && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = ids.get(entry.target)
          if (id) ratios.set(id, entry.intersectionRatio)
        }
        // The first card, in row order, that is almost fully on screen.
        current.value = order.find((id) => (ratios.get(id) ?? 0) >= 0.9) ?? null
      },
      { threshold: [0, 0.5, 0.9, 1] },
    )
  }

  provide(ROW_KEY, {
    current,
    register(id, el) {
      order.push(id)
      ids.set(el, id)
      observer?.observe(el)
      return () => {
        observer?.unobserve(el)
        ids.delete(el)
        ratios.delete(id)
        order.splice(order.indexOf(id), 1)
      }
    },
  })

  onUnmounted(() => observer?.disconnect())
}

/** Used by a card. Returns whether it is previewing, and the handlers to attach. */
export function usePreview(allowed: () => boolean) {
  const id = useId()
  const row = inject(ROW_KEY, null)
  const root = ref<HTMLElement>()
  let timer: ReturnType<typeof setTimeout> | undefined
  let unregister: (() => void) | undefined

  function start() {
    if (allowed() && !reduceMotion) activeId.value = id
  }
  function stop() {
    clearTimeout(timer)
    if (activeId.value === id) activeId.value = null
  }

  const handlers = {
    mouseenter() {
      if (noHover) return
      clearTimeout(timer)
      timer = setTimeout(start, HOVER_DELAY_MS)
    },
    mouseleave: stop,
    focusin: start,
    // Moving focus within the card (to its mute button) keeps it playing.
    focusout(event: FocusEvent) {
      if ((event.currentTarget as Element).contains(event.relatedTarget as Node | null)) return
      stop()
    },
  }

  onMounted(() => {
    if (row && root.value) unregister = row.register(id, root.value)
  })
  onUnmounted(() => {
    stop()
    unregister?.()
  })

  const previewing = computed(
    () => allowed() && !reduceMotion && (activeId.value === id || (noHover && row?.current.value === id)),
  )

  return { root, previewing, handlers }
}
