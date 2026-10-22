import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// The search overlay opens over whatever page you are on.
// Whether it is open lives in the address (?search=rome), not in a variable:
// - a search can be shared, and reloading keeps it open;
// - opening adds a history entry, so Back closes it;
// - Back from a result returns to the page with the search still open.

export const SEARCH_PARAM = 'search'

export function useSearchOverlay() {
  const route = useRoute()
  const router = useRouter()

  const isOpen = computed(() => SEARCH_PARAM in route.query)

  function openSearch(query = '') {
    if (isOpen.value) {
      document.getElementById('search-input')?.focus()
      return
    }
    // The history entry remembers it was opened over a page, so closing
    // can step Back rather than leave an extra entry behind.
    void router.push({ query: { ...route.query, [SEARCH_PARAM]: query }, state: { searchOverPage: true } })
  }

  function closeSearch() {
    if (!isOpen.value) return
    if (window.history.state?.searchOverPage) {
      router.back()
      return
    }
    const { [SEARCH_PARAM]: _removed, ...rest } = route.query
    void router.replace({ query: rest })
  }

  return { isOpen, openSearch, closeSearch }
}
