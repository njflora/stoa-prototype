import { computed, type WritableComputedRef } from 'vue'
import { useRoute, useRouter, type LocationQueryRaw } from 'vue-router'
import { readView, writeQuery, type AddressFields } from '@/utils/address'

/**
 * A page's view (sort, filters, page) read from the address, with a v-model
 * for each field. Changing a field other than the page starts again from
 * page 1, as a new history entry, so Back undoes it.
 */
export function useAddressState<V extends object>(fields: AddressFields<V>) {
  const route = useRoute()
  const router = useRouter()

  const view = computed(() => readView(fields, route.query))

  /** The query for the current view with some fields changed: for links and navigation. */
  const query = (changes: Partial<V> = {}): LocationQueryRaw => writeQuery(fields, { ...view.value, ...changes })

  function model<K extends keyof V>(key: K): WritableComputedRef<V[K]> {
    return computed({
      get: () => view.value[key],
      set: (value) => {
        const changes = { [key]: value, ...(key !== 'page' && 'page' in fields ? { page: 0 } : {}) } as Partial<V>
        void router.push({ query: query(changes) })
      },
    })
  }

  return { view, query, model }
}
