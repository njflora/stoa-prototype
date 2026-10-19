<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from './AppIcon.vue'
import { useViewer } from '@/composables/useViewer'

// One top bar replaces the long side navigation. Watching sits on the
// left; articles, courses and the upgrade route sit on the right.

const { isMember, isLive } = useViewer()

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

const primary = [
  { label: 'Home', to: '/' },
  { label: 'Shows', to: '/shows' },
  { label: 'Live', to: '/live' },
]
const secondary = [
  { label: 'Articles', to: '/articles' },
  { label: 'Courses', to: '/courses' },
]
</script>

<template>
  <header ref="header" class="sticky top-0 z-40 border-b border-white/5 bg-ink/85 backdrop-blur-md">
    <div class="flex h-14 items-center gap-6 px-4 sm:h-16 sm:px-8">
      <RouterLink to="/" class="font-serif text-2xl font-bold tracking-tight" aria-label="Stoa home">
        Stoa
      </RouterLink>

      <nav aria-label="Main" class="hidden md:block">
        <ul class="flex items-center gap-6 text-sm">
          <li v-for="link in primary" :key="link.to">
            <RouterLink
              :to="link.to"
              class="flex items-center gap-1.5 text-white/70 transition hover:text-white"
              exact-active-class="!text-white font-semibold"
            >
              <span
                v-if="link.to === '/live' && isLive"
                class="size-2 animate-pulse rounded-full bg-live motion-reduce:animate-none"
              />
              {{ link.label }}
            </RouterLink>
          </li>
        </ul>
      </nav>

      <div class="ml-auto flex items-center gap-2 sm:gap-4">
        <ul class="hidden items-center gap-5 text-sm md:flex">
          <li v-for="link in secondary" :key="link.to">
            <RouterLink
              :to="link.to"
              class="text-white/70 transition hover:text-white"
              exact-active-class="!text-white font-semibold"
            >
              {{ link.label }}
            </RouterLink>
          </li>
        </ul>

        <RouterLink
          to="/search"
          class="grid size-9 place-items-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
          aria-label="Search"
        >
          <AppIcon name="search" />
        </RouterLink>

        <span
          v-if="isMember"
          class="rounded-full border border-gold/50 px-3 py-1 text-xs font-semibold text-gold"
        >
          Member
        </span>
        <RouterLink
          v-else
          to="/join"
          class="rounded-lg bg-gold px-4 py-1.5 text-sm font-semibold text-ink transition hover:brightness-110"
        >
          Upgrade
        </RouterLink>
      </div>
    </div>

    <!-- Small screens: the same links in one swipeable strip. -->
    <nav aria-label="Main" class="no-scrollbar overflow-x-auto md:hidden">
      <ul class="flex gap-5 px-4 pb-2.5 text-sm whitespace-nowrap">
        <li v-for="link in [...primary, ...secondary]" :key="link.to">
          <RouterLink
            :to="link.to"
            class="flex items-center gap-1.5 text-white/70"
            exact-active-class="!text-white font-semibold"
          >
            <span
              v-if="link.to === '/live' && isLive"
              class="size-2 animate-pulse rounded-full bg-live motion-reduce:animate-none"
            />
            {{ link.label }}
          </RouterLink>
        </li>
      </ul>
    </nav>
  </header>
</template>
