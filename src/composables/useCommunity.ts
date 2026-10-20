import { ref, watch } from 'vue'
import { readJson, writeJson } from './storage'

// Which communities this account has joined, such as the Philosophy Circle.
// Kept on the device: the prototype has no server. Shared by every page,
// so joining on the course page shows straight away on the account page.

const STORAGE_KEY = 'stoa-communities'
const joined = ref<string[]>(readJson<string[]>(STORAGE_KEY, []))
watch(joined, (value) => writeJson(STORAGE_KEY, value), { deep: true })

export function useCommunity() {
  const isJoined = (id: string) => joined.value.includes(id)
  function join(id: string) {
    if (!isJoined(id)) joined.value = [...joined.value, id]
  }
  function leave(id: string) {
    joined.value = joined.value.filter((c) => c !== id)
  }
  return { joined, isJoined, join, leave }
}
