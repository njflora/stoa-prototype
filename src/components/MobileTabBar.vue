<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AppIcon, { type IconName } from './AppIcon.vue'
import { tierStyles } from '@/data/chat'
import { useSearchOverlay } from '@/composables/useSearchOverlay'
import { useViewer } from '@/composables/useViewer'

// Phones only (below 768px): an app-style tab bar fixed to the bottom of
// the screen, within reach of a thumb. "More" opens a sheet with the rest.
// Larger screens keep the top bar instead.

type TabId = 'home' | 'live' | 'shows' | 'search' | 'more'

const route = useRoute()
const { isLive, isStaff, user } = useViewer()
const { isOpen: searchOpen, openSearch } = useSearchOverlay()

const tabs: { id: Exclude<TabId, 'search' | 'more'>; label: string; to: string; icon: IconName }[] = [
  { id: 'home', label: 'Home', to: '/', icon: 'home' },
  { id: 'live', label: 'Live', to: '/live', icon: 'live' },
  { id: 'shows', label: 'Shows', to: '/shows', icon: 'grid' },
]

/** Which tab the current page belongs to, so series and episode pages light up a sensible tab. */
const current = computed<TabId | null>(() => {
  const path = route.path
  if (searchOpen.value) return 'search'
  if (path === '/') return 'home'
  if (path.startsWith('/live')) return 'live'
  if (path.startsWith('/shows') || path.startsWith('/series') || path.startsWith('/watch')) return 'shows'
  if (['/articles', '/courses', '/shop', '/account', '/sign-in', '/join', '/pitch', '/credits', '/desk'].some((p) => path.startsWith(p)))
    return 'more'
  return null
})

// The "More" sheet.
const open = ref(false)
const moreButton = ref<HTMLButtonElement>()
const sheet = ref<HTMLElement>()

async function openSheet() {
  open.value = true
  await nextTick()
  sheet.value?.querySelector<HTMLElement>('a, button')?.focus()
}
function closeSheet(returnFocus = true) {
  if (!open.value) return
  open.value = false
  if (returnFocus) moreButton.value?.focus()
}

// Going to another page closes the sheet.
watch(() => route.fullPath, () => closeSheet(false))

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closeSheet()
}
onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))

const tabClass = 'flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition'
</script>

<template>
  <nav
    aria-label="Main"
    class="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/95 backdrop-blur-md md:hidden"
    :style="{ paddingBottom: 'env(safe-area-inset-bottom)' }"
  >
    <ul class="grid h-14 grid-cols-5">
      <li v-for="tab in tabs" :key="tab.id">
        <RouterLink
          :to="tab.to"
          :class="[tabClass, current === tab.id ? 'text-accent-bright' : 'text-white/65 hover:text-white']"
          :aria-current="current === tab.id ? 'page' : undefined"
        >
          <span class="relative">
            <AppIcon :name="tab.icon" />
            <span
              v-if="tab.id === 'live' && isLive"
              class="absolute -top-0.5 -right-1 size-2 animate-pulse rounded-full bg-live ring-2 ring-ink motion-reduce:animate-none"
            />
          </span>
          {{ tab.label }}
          <span v-if="tab.id === 'live' && isLive" class="sr-only">(on air)</span>
        </RouterLink>
      </li>
      <li>
        <!-- Search opens over the current page, so it is a button, not a link. -->
        <button
          type="button"
          :class="[tabClass, 'w-full', current === 'search' ? 'text-accent-bright' : 'text-white/65 hover:text-white']"
          :aria-pressed="searchOpen"
          @click="openSearch()"
        >
          <AppIcon name="search" />
          Search
        </button>
      </li>
      <li>
        <button
          ref="moreButton"
          type="button"
          :class="[tabClass, 'w-full', open || current === 'more' ? 'text-accent-bright' : 'text-white/65 hover:text-white']"
          :aria-expanded="open"
          aria-controls="more-sheet"
          @click="open ? closeSheet() : openSheet()"
        >
          <AppIcon name="menu" />
          More
        </button>
      </li>
    </ul>
  </nav>

  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="open" class="fixed inset-0 z-[55] md:hidden">
        <div class="absolute inset-0 bg-black/55" aria-hidden="true" @click="closeSheet()" />
        <section
          id="more-sheet"
          ref="sheet"
          role="dialog"
          aria-modal="true"
          aria-label="More"
          class="absolute inset-x-0 bottom-0 rounded-t-2xl bg-raised px-4 pt-3 ring-1 ring-white/10"
          :style="{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }"
        >
          <div class="mx-auto mb-3 h-1 w-10 rounded-full bg-white/25" aria-hidden="true" />
          <ul class="divide-y divide-white/5">
            <li>
              <RouterLink to="/articles" class="flex h-12 items-center justify-between text-base">
                Articles <AppIcon name="chevron-right" class="text-muted" />
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/courses" class="flex h-12 items-center justify-between text-base">
                Courses <AppIcon name="chevron-right" class="text-muted" />
              </RouterLink>
            </li>
            <li v-if="isStaff">
              <RouterLink to="/desk" class="flex h-12 items-center justify-between text-base">
                Content desk <AppIcon name="chevron-right" class="text-muted" />
              </RouterLink>
            </li>
          </ul>

          <RouterLink
            to="/shop"
            class="mt-3 flex h-12 items-center justify-center gap-2 rounded-lg bg-accent font-semibold text-white hover:bg-accent-bright [&>svg]:size-4"
          >
            <AppIcon name="shop" />
            Shop
          </RouterLink>

          <RouterLink
            v-if="user"
            to="/account"
            class="mt-3 flex h-12 items-center gap-3 rounded-lg bg-white/5 px-3 hover:bg-white/10"
          >
            <span class="grid size-8 place-items-center rounded-full bg-accent text-xs font-bold">{{ user.initials }}</span>
            <span class="font-medium">{{ user.name }}</span>
            <span
              v-if="user.tier"
              class="rounded px-1.5 py-px text-[10px] font-bold tracking-wide uppercase"
              :class="tierStyles[user.tier].class"
            >
              {{ tierStyles[user.tier].label }}
            </span>
            <span class="ml-auto text-sm text-muted">Account</span>
          </RouterLink>
          <RouterLink
            v-else
            to="/sign-in"
            class="mt-3 flex h-12 items-center justify-center rounded-lg font-semibold ring-1 ring-white/25 hover:bg-white/10"
          >
            Sign in / Sign up
          </RouterLink>

          <button type="button" class="mt-3 h-11 w-full text-sm text-muted hover:text-white" @click="closeSheet()">
            Close
          </button>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.2s ease;
}
.sheet-enter-active section,
.sheet-leave-active section {
  transition: transform 0.2s ease;
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
.sheet-enter-from section,
.sheet-leave-to section {
  transform: translateY(100%);
}
@media (prefers-reduced-motion: reduce) {
  .sheet-enter-active,
  .sheet-leave-active,
  .sheet-enter-active section,
  .sheet-leave-active section {
    transition: none;
  }
}
</style>
