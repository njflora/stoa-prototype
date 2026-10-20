import { ref, watch } from 'vue'
import { readJson, writeJson } from './storage'

// Members' episodes bought one at a time, kept on the account to watch any
// time. The prototype has no server or payments: buying just records the
// id on this device. useViewer's canWatch checks this list, so every lock
// on the site respects a purchase without further changes.

const STORAGE_KEY = 'stoa-purchases'
const owned = ref<string[]>(readJson<string[]>(STORAGE_KEY, []))
watch(owned, (value) => writeJson(STORAGE_KEY, value), { deep: true })

export function usePurchases() {
  const isOwned = (episodeId: string) => owned.value.includes(episodeId)
  function buy(episodeId: string) {
    if (!isOwned(episodeId)) owned.value = [episodeId, ...owned.value]
  }
  return { owned, isOwned, buy }
}
