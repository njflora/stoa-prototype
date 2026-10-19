import { onUnmounted, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { search, type SearchResults } from '@/api/search'
import { SEARCH_PARAM } from './useSearchOverlay'

// Search as you type.
// - Debounced: it waits until typing pauses (150ms) before searching, so it
//   does not run on every keystroke.
// - The query lives in the address (?search=rome), so a search can be
//   shared, and Back from a result returns to it. Typing replaces the
//   address rather than adding to history, so Back is not filled with
//   every letter.
// - If an older search finishes after a newer one, its results are ignored.

const DEBOUNCE_MS = 150

export function useSearch() {
  const route = useRoute()
  const router = useRouter()

  const fromAddress = () => {
    const value = route.query[SEARCH_PARAM]
    return typeof value === 'string' ? value : ''
  }
  const query = ref(fromAddress())
  const results = shallowRef<SearchResults | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  let timer: ReturnType<typeof setTimeout> | undefined
  let latest = 0

  async function run(value: string) {
    const ticket = ++latest
    loading.value = true
    error.value = null
    try {
      const found = await search(value)
      if (ticket === latest) results.value = found
    } catch (cause) {
      if (ticket === latest) error.value = cause instanceof Error ? cause : new Error(String(cause))
    } finally {
      if (ticket === latest) loading.value = false
    }
  }

  watch(
    query,
    (value, previous) => {
      clearTimeout(timer)
      const go = () => {
        // Only while the overlay is open. Keeps the rest of the address; Vue
        // Router keeps the history entry's state (see useSearchOverlay).
        if (SEARCH_PARAM in route.query && value !== fromAddress()) {
          router.replace({ query: { ...route.query, [SEARCH_PARAM]: value } })
        }
        run(value)
      }
      // The first run (from the address) happens straight away.
      if (previous === undefined) go()
      else timer = setTimeout(go, DEBOUNCE_MS)
    },
    { immediate: true },
  )

  // Following a link to another search (such as a host result) updates the box.
  watch(fromAddress, (value) => {
    if (SEARCH_PARAM in route.query && value !== query.value) query.value = value
  })

  onUnmounted(() => clearTimeout(timer))

  return { query, results, loading, error, retry: () => run(query.value) }
}
