<script setup lang="ts">
// A still, card-shaped placeholder shown while a row's episodes load, so
// the page keeps its shape instead of jumping when the data arrives.
withDefaults(defineProps<{ count?: number; fluid?: boolean }>(), { count: 5, fluid: false })
</script>

<template>
  <div v-for="n in count" :key="n" :class="fluid ? 'min-w-0' : 'w-60 flex-none sm:w-72'" aria-hidden="true">
    <div class="aspect-video rounded-lg bg-surface ring-1 ring-white/5" />
    <div class="mt-2 h-4 w-4/5 rounded bg-surface" />
    <div class="mt-1.5 h-3 w-1/2 rounded bg-surface" />
  </div>
</template>
