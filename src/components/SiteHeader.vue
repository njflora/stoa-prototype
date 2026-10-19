<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from './AppIcon.vue'
import PitchNote from './PitchNote.vue'
import NotificationBell from './NotificationBell.vue'
import UserBadge from './UserBadge.vue'
import { useViewer } from '@/composables/useViewer'

// One top bar replaces the long side navigation.
// Left:  Stoa · Live · Home · Shows · Articles · Courses · Search
// Right: Shop · Upgrade (not members) · bell (members) · account or sign in
// On phones (below 768px) the links move to the bottom tab bar
// (MobileTabBar.vue). Stoa, Upgrade, the bell and the account stay here.

const { isMember, isLive, user } = useViewer()

const links = [
  { label: 'Live', to: '/live' },
  { label: 'Home', to: '/' },
  { label: 'Shows', to: '/shows' },
  { label: 'Articles', to: '/articles' },
  { label: 'Courses', to: '/courses' },
]

// Publish the header's height as --header-h, so full-height layouts such
// as the live page can fit exactly beneath it.
const header = ref<HTMLElement>()
let resizeObserver: ResizeObserver | undefined
onMounted(() => {
  if (!header.value || !('ResizeObserver' in window)) return
  resizeObserver = new ResizeObserver(([entry]) => {
    const height = entry?.borderBoxSize?.[0]?.blockSize ?? header.value!.offsetHeight
    document.documentElement.style.setProperty('--header-h', `${height}px`)
  })
  resizeObserver.observe(header.value)
})
onUnmounted(() => resizeObserver?.disconnect())

const linkClass = 'flex items-center gap-1.5 text-white/70 transition hover:text-white'
const activeClass = '!text-white font-semibold'
</script>

<template>
  <header ref="header" class="sticky top-0 z-40 border-b border-white/5 bg-ink/85 backdrop-blur-md">
    <div class="flex h-14 items-center gap-6 px-4 sm:h-16 sm:px-8">
      <div class="flex items-center gap-2">
        <RouterLink to="/" class="font-serif text-2xl font-bold tracking-tight" aria-label="Stoa home">
          Stoa
        </RouterLink>
        <PitchNote id="nav" />
      </div>

      <nav aria-label="Main" class="hidden md:block">
        <ul class="flex items-center gap-5 text-sm">
          <li v-for="link in links" :key="link.to">
            <RouterLink :to="link.to" :class="linkClass" :exact-active-class="activeClass">
              <span
                v-if="link.to === '/live' && isLive"
                class="size-2 animate-pulse rounded-full bg-live motion-reduce:animate-none"
              />
              {{ link.label }}
            </RouterLink>
          </li>
          <li>
            <RouterLink
              to="/search"
              class="grid size-9 place-items-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
              aria-label="Search"
            >
              <AppIcon name="search" />
            </RouterLink>
          </li>
        </ul>
      </nav>

      <div class="ml-auto flex items-center gap-1.5 sm:gap-3">
        <RouterLink
          to="/shop"
          class="hidden items-center gap-1.5 rounded-lg bg-accent px-4 py-1.5 text-sm font-semibold whitespace-nowrap text-white transition hover:bg-accent-bright md:inline-flex [&>svg]:size-4"
        >
          <AppIcon name="shop" />
          Shop
        </RouterLink>

        <RouterLink
          v-if="!isMember"
          to="/join"
          class="inline-flex items-center gap-1.5 rounded-lg bg-gold px-3 py-1.5 text-sm font-semibold whitespace-nowrap text-ink transition hover:brightness-110 sm:px-4 [&>svg]:size-4"
        >
          <AppIcon name="crown" />
          <!-- On the narrowest phones only the crown shows; the label stays for screen readers. -->
          <span class="max-[359px]:sr-only">Upgrade</span>
        </RouterLink>

        <NotificationBell v-if="isMember" />

        <UserBadge v-if="user" :user="user" />
        <RouterLink
          v-else
          to="/sign-in"
          class="rounded-lg px-2.5 py-1.5 text-sm font-semibold whitespace-nowrap ring-1 ring-white/25 transition hover:bg-white/10 sm:px-3"
        >
          <span class="hidden lg:inline">Sign in / Sign up</span>
          <span class="lg:hidden">Sign in</span>
        </RouterLink>
      </div>
    </div>
  </header>
</template>
