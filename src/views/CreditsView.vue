<script setup lang="ts">
import { artworks, heroVideo, mediaUrl } from '@/data/media'

// Every image and video on the site, with its artist, date, licence and
// source. Built from the same data as CREDITS.md, so the two always match.
</script>

<template>
  <main class="px-4 pt-10 sm:px-8">
    <h1 class="text-3xl font-bold">Image and video credits</h1>

    <h2 class="mt-10 text-lg font-semibold">Images</h2>
    <ul class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="art in artworks" :key="art.id" class="flex gap-3 rounded-lg bg-surface p-3 ring-1 ring-white/10">
        <img
          :src="mediaUrl(art.card)"
          :alt="art.alt"
          loading="lazy"
          decoding="async"
          class="aspect-video w-28 shrink-0 rounded object-cover"
        />
        <div class="min-w-0 text-sm">
          <p class="font-semibold">{{ art.name }}</p>
          <p class="text-white/75">{{ art.artist }}, {{ art.date }}</p>
          <p class="mt-1 text-xs text-muted">
            {{ art.licence }} ·
            <a :href="art.sourceUrl" target="_blank" rel="noopener" class="underline hover:text-white">Source</a>
          </p>
        </div>
      </li>
    </ul>

    <h2 class="mt-10 text-lg font-semibold">Video</h2>
    <div class="mt-4 flex max-w-md gap-3 rounded-lg bg-surface p-3 ring-1 ring-white/10">
      <img
        :src="mediaUrl(heroVideo.posterCard)"
        :alt="heroVideo.alt"
        loading="lazy"
        class="aspect-video w-28 shrink-0 rounded object-cover"
      />
      <div class="min-w-0 text-sm">
        <p class="font-semibold">{{ heroVideo.name }}</p>
        <p class="text-white/75">{{ heroVideo.artist }}, {{ heroVideo.date }}</p>
        <p class="mt-1 text-xs text-muted">
          {{ heroVideo.licence }} ·
          <a :href="heroVideo.sourceUrl" target="_blank" rel="noopener" class="underline hover:text-white">Source</a>
        </p>
      </div>
    </div>
  </main>
</template>
