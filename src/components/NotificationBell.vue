<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useId } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from './AppIcon.vue'
import { getLiveEvent, getShow } from '@/data/catalogue'
import { useReminders } from '@/composables/useReminders'
import { useViewer } from '@/composables/useViewer'

// Members only. Lists the live reminders the member has turned on, and
// flags a followed show that is live right now.

const { reminders, turnOff } = useReminders()
const { isLive } = useViewer()

const open = ref(false)
const root = ref<HTMLElement>()
const panelId = useId()

const items = computed(() => reminders.value.map((id) => ({ id, name: getShow(id).name })))
const liveEvent = getLiveEvent()
const liveFollowed = computed(() => isLive.value && reminders.value.includes(liveEvent.showId))
const count = computed(() => reminders.value.length)

function onDocumentClick(event: MouseEvent) {
  if (open.value && root.value && !root.value.contains(event.target as Node)) open.value = false
}
function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') open.value = false
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKeydown)
})
onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="relative grid size-9 place-items-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
      :aria-expanded="open"
      :aria-controls="panelId"
      :aria-label="count ? `Live reminders, ${count} on` : 'Live reminders'"
      @click="open = !open"
    >
      <AppIcon name="bell" />
      <span
        v-if="liveFollowed || count"
        class="absolute top-1 right-1 grid min-w-4 place-items-center rounded-full px-1 text-[10px] leading-4 font-bold"
        :class="liveFollowed ? 'bg-live text-white' : 'bg-accent-bright text-white'"
        aria-hidden="true"
      >
        {{ liveFollowed ? '!' : count }}
      </span>
    </button>

    <div
      v-show="open"
      :id="panelId"
      class="absolute top-full right-0 mt-2 w-72 rounded-xl bg-raised p-3 shadow-2xl ring-1 ring-white/10"
    >
      <p class="px-1 text-xs font-semibold tracking-wide text-muted uppercase">Live reminders</p>

      <RouterLink
        v-if="liveFollowed"
        to="/live"
        class="mt-2 flex items-center gap-2 rounded-lg bg-live/15 px-2 py-2 text-sm ring-1 ring-live/40 hover:bg-live/25"
        @click="open = false"
      >
        <span class="size-2 animate-pulse rounded-full bg-live motion-reduce:animate-none" />
        <span><span class="font-semibold">{{ getShow(liveEvent.showId).name }}</span> is live now</span>
      </RouterLink>

      <ul v-if="items.length" class="mt-2 space-y-1">
        <li v-for="item in items" :key="item.id" class="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-white/5">
          <span class="flex min-w-0 items-center gap-2 text-sm">
            <AppIcon name="check" class="!size-4 text-accent-bright" />
            <span class="truncate">{{ item.name }}</span>
          </span>
          <button
            type="button"
            class="shrink-0 text-xs text-muted hover:text-white"
            :aria-label="`Remove the reminder for ${item.name}`"
            @click="turnOff(item.id)"
          >
            Remove
          </button>
        </li>
      </ul>

      <p v-else class="mt-2 px-1 text-sm text-white/75">
        No reminders yet. Use <span class="font-semibold">Notify me</span> on the
        <RouterLink to="/live" class="underline hover:text-white" @click="open = false">live page</RouterLink>.
      </p>
    </div>
  </div>
</template>
