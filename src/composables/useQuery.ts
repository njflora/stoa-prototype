import { ref, shallowRef, watch, type Ref, type ShallowRef } from 'vue'

// Turns any async call into reactive data for a template:
//   const { data, loading, error, reload } = useQuery(() => route.params.id, () => getEpisode(id))
// It runs straight away, and again whenever the watched input changes.
// If an older request finishes after a newer one started, its result is
// ignored, so a quick change of page never shows the wrong episode.

export interface Query<T> {
  data: ShallowRef<T | undefined>
  loading: Ref<boolean>
  error: Ref<Error | null>
  reload: () => Promise<void>
}

export function useQuery<T>(input: () => unknown, fetcher: () => Promise<T>): Query<T> {
  const data = shallowRef<T>()
  const loading = ref(true)
  const error = ref<Error | null>(null)
  let latest = 0

  async function load() {
    const run = ++latest
    loading.value = true
    error.value = null
    try {
      const result = await fetcher()
      if (run === latest) data.value = result
    } catch (cause) {
      if (run === latest) error.value = cause instanceof Error ? cause : new Error(String(cause))
    } finally {
      if (run === latest) loading.value = false
    }
  }

  watch(input, load, { immediate: true })
  return { data, loading, error, reload: load }
}
