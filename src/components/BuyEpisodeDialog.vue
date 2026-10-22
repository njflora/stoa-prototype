<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { getShow } from '@/data/catalogue'
import { EPISODE_PRICE } from '@/data/membership'
import { usePurchases } from '@/composables/usePurchases'
import type { Episode } from '@/types/content'
import { formatPrice } from '@/utils/format'

// Confirms buying one members' episode. The ARIA dialog pattern: focus
// moves into the dialog, Tab stays inside, Escape or Cancel closes it, and
// focus returns to the button that opened it. No payment is taken: the
// demo never asks for card details.

const props = defineProps<{ episode: Episode }>()
const open = defineModel<boolean>({ required: true })
const emit = defineEmits<{ bought: [] }>()

const { buy } = usePurchases()
const panel = ref<HTMLElement>()
const confirm = ref<HTMLButtonElement>()
let returnTo: HTMLElement | null = null

watch(open, async (isOpen) => {
  if (isOpen) {
    returnTo = document.activeElement as HTMLElement | null
    await nextTick()
    confirm.value?.focus()
  } else {
    returnTo?.focus()
  }
})

// Saving the purchase can fail (in Laravel mode it goes to the server), so
// the dialog stays open with a message instead of pretending it worked.
const busy = ref(false)
const failed = ref(false)
async function confirmBuy() {
  busy.value = true
  failed.value = false
  try {
    await buy(props.episode.id)
    open.value = false
    emit('bought')
  } catch {
    failed.value = true
  } finally {
    busy.value = false
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    open.value = false
    return
  }
  if (event.key !== 'Tab' || !panel.value) return
  const focusable = [...panel.value.querySelectorAll<HTMLElement>('button')]
  const first = focusable[0]
  const last = focusable.at(-1)
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[58] grid place-items-center bg-black/60 px-4" @click.self="open = false">
      <section
        ref="panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="buy-title"
        aria-describedby="buy-detail"
        class="w-full max-w-md rounded-xl bg-raised p-5 shadow-2xl ring-1 ring-white/15"
        @keydown="onKeydown"
      >
        <h2 id="buy-title" class="text-lg font-semibold">Buy this episode</h2>
        <div id="buy-detail" class="mt-2 text-sm text-white/85">
          <p class="font-medium text-white">{{ episode.title }}</p>
          <p class="text-muted">{{ getShow(episode.showId).name }}</p>
          <p class="mt-3">Yours to keep on your account, to watch any time.</p>
        </div>
        <p class="mt-4 text-3xl font-bold">{{ formatPrice(EPISODE_PRICE) }}</p>
        <p class="mt-1 flex items-center gap-1.5 text-xs text-muted [&>svg]:size-3.5">
          <AppIcon name="info" /> Demo: no payment is taken.
        </p>
        <div class="mt-5 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            class="min-h-10 rounded-lg px-4 text-sm font-semibold text-white/80 ring-1 ring-white/15 hover:bg-white/10"
            @click="open = false"
          >
            Cancel
          </button>
          <button
            ref="confirm"
            type="button"
            class="min-h-10 rounded-lg bg-white px-4 text-sm font-semibold text-ink hover:brightness-95 disabled:opacity-60"
            :disabled="busy"
            @click="confirmBuy"
          >
            Buy for {{ formatPrice(EPISODE_PRICE) }}
          </button>
        </div>
        <p v-if="failed" class="mt-3 text-sm text-[#ff8a80]" role="alert">That did not go through. Please try again.</p>
      </section>
    </div>
  </Teleport>
</template>
