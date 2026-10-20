import { computed, ref, watch } from 'vue'
import { account, buyEpisode } from '@/api/account'
import { API_MODE } from '@/api/client'
import { readJson, writeJson } from './storage'

// Members' episodes bought one at a time, kept on the account to watch any
// time. No payment is taken in the demo. In Laravel mode a purchase is saved
// on the account, and the server unlocks that one episode. In the static
// preview it is recorded on this device. useViewer's canWatch checks this
// list, so every lock on the site respects a purchase.

const STORAGE_KEY = 'stoa-purchases'
const local = ref<string[]>(readJson<string[]>(STORAGE_KEY, []))
watch(local, (value) => writeJson(STORAGE_KEY, value), { deep: true })

export function usePurchases() {
  const owned = computed(() => (API_MODE === 'laravel' ? account.value.purchases : local.value))
  const isOwned = (episodeId: string) => owned.value.includes(episodeId)
  async function buy(episodeId: string) {
    if (isOwned(episodeId)) return
    if (API_MODE === 'laravel') await buyEpisode(episodeId)
    else local.value = [episodeId, ...local.value]
  }
  return { owned, isOwned, buy }
}
