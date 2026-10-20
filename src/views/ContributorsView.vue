<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { reference } from '@/api/catalogue'

// Everyone who presents, writes or appears regularly. Initials instead of
// photos: the contributors are invented, and no real likeness is used.
const people = [...reference.hosts].sort((a, b) => (b.episodeCount ?? 0) - (a.episodeCount ?? 0))
const showName = (id: string) => reference.shows.find((s) => s.id === id)?.name ?? id
const initials = (name: string) => name.split(' ').map((w) => w[0]).join('').slice(0, 2)
</script>

<template>
  <main class="px-4 pt-8 sm:px-8">
    <h1 class="text-3xl font-bold sm:text-4xl">Contributors</h1>
    <p class="mt-2 max-w-2xl text-white/75">The people behind the shows and articles. Open a profile to see everything they have made.</p>

    <ul class="mt-8 grid grid-cols-1 gap-4 min-[560px]:grid-cols-2 lg:grid-cols-3">
      <li v-for="person in people" :key="person.id">
        <RouterLink
          :to="`/contributors/${person.id}`"
          class="flex h-full gap-4 rounded-xl bg-surface p-4 ring-1 ring-white/10 outline-none hover:ring-white/30 focus-visible:ring-2 focus-visible:ring-accent-bright"
        >
          <span class="grid size-14 shrink-0 place-items-center rounded-full bg-accent text-lg font-bold">{{ initials(person.name) }}</span>
          <span class="min-w-0">
            <span class="block font-semibold">{{ person.name }}</span>
            <span class="block text-sm text-white/75">{{ person.role }}</span>
            <span class="mt-1 block text-xs text-muted">
              {{ (person.showIds ?? []).map(showName).join(', ') }}
            </span>
            <span class="mt-1 block text-xs text-muted">
              {{ (person.episodeCount ?? 0).toLocaleString('en-GB') }} episodes<template v-if="person.articleCount">
                · {{ person.articleCount }} {{ person.articleCount === 1 ? 'article' : 'articles' }}</template>
            </span>
          </span>
        </RouterLink>
      </li>
    </ul>
  </main>
</template>
