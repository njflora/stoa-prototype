import { computed, ref, watch } from 'vue'
import { account, joinCommunity, leaveCommunity } from '@/api/account'
import { API_MODE } from '@/api/client'
import { readJson, writeJson } from './storage'

// Which communities this account has joined, such as the Philosophy Circle.
// Saved on the account in Laravel mode, and on this device in the static
// preview. Shared by every page, so joining on the course page shows
// straight away on the account page.

const STORAGE_KEY = 'stoa-communities'
const local = ref<string[]>(readJson<string[]>(STORAGE_KEY, []))
watch(local, (value) => writeJson(STORAGE_KEY, value), { deep: true })

export function useCommunity() {
  const joined = computed(() => (API_MODE === 'laravel' ? account.value.communities : local.value))
  const isJoined = (id: string) => joined.value.includes(id)
  async function join(id: string) {
    if (isJoined(id)) return
    if (API_MODE === 'laravel') await joinCommunity(id)
    else local.value = [...local.value, id]
  }
  async function leave(id: string) {
    if (API_MODE === 'laravel') await leaveCommunity(id)
    else local.value = local.value.filter((c) => c !== id)
  }
  return { joined, isJoined, join, leave }
}
