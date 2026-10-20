<script setup lang="ts">
import ShowCard from '@/components/ShowCard.vue'
import { listShows } from '@/data/catalogue'

// Every show, free ones first. Each card opens the show's page, with its
// full archive, series and filters.
const free = listShows().filter((s) => s.access === 'free')
const members = listShows().filter((s) => s.access === 'premium')
const total = listShows().reduce((sum, s) => sum + (s.episodeCount ?? 0), 0)
</script>

<template>
  <main class="px-4 pt-8 sm:px-8">
    <h1 class="text-3xl font-bold sm:text-4xl">Shows</h1>
    <p class="mt-2 max-w-2xl text-white/75">
      {{ listShows().length }} shows and {{ total.toLocaleString('en-GB') }} episodes. Every episode of every show is one click
      away, sorted and filtered the way you want.
    </p>

    <section class="mt-8" aria-labelledby="free-shows">
      <h2 id="free-shows" class="text-lg font-semibold sm:text-xl">Free to watch</h2>
      <div class="mt-4 grid grid-cols-1 gap-x-4 gap-y-8 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <ShowCard v-for="show in free" :key="show.id" :show="show" />
      </div>
    </section>

    <section class="mt-12" aria-labelledby="member-shows">
      <h2 id="member-shows" class="text-lg font-semibold sm:text-xl">For members</h2>
      <p class="mt-1 text-sm text-muted">Each has free previews, so you can try before you join.</p>
      <div class="mt-4 grid grid-cols-1 gap-x-4 gap-y-8 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <ShowCard v-for="show in members" :key="show.id" :show="show" />
      </div>
    </section>
  </main>
</template>
